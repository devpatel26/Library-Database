import express from "express";
import mysql from "mysql2";
import dotenv from "dotenv";
import cors from "cors";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const backendDirectory = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(backendDirectory, ".env") });

const app = express();
const port = Number(process.env.PORT) || 3000;
const sessionMaxAgeSeconds = Math.max(
    Number(process.env.SESSION_MAX_AGE_SECONDS) || 60 * 60 * 12,
    60
);
const sessionSecret =
    process.env.SESSION_SECRET?.trim() ||
    (process.env.NODE_ENV === "production"
        ? ""
        : "library-dev-session-secret-change-me");

if (!sessionSecret) {
    throw new Error("SESSION_SECRET must be set when NODE_ENV=production.");
}

if (!process.env.SESSION_SECRET && process.env.NODE_ENV !== "production") {
    console.warn(
        'SESSION_SECRET is not set in "backend/.env". Using a development fallback secret.'
    );
}

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
})
.promise();

const searchSorts = {
    title: "title ASC",
    newest: "publicationDate DESC, title ASC",
    availability: "available DESC, title ASC",
};

app.use(cors());
app.use(express.json());

function FormatServerError(error, fallbackMessage) {
    if (process.env.NODE_ENV === "production") {
        return fallbackMessage;
    }

    if (error instanceof Error && error.message) {
        return error.message;
    }

    return fallbackMessage;
}

function SendServerError(res, error, fallbackMessage) {
    console.error(error);
    res.status(500).json({ error: FormatServerError(error, fallbackMessage) });
}

function GetMissingDatabaseConfigKeys() {
    return ["DB_HOST", "DB_USER", "DB_NAME"].filter((key) => {
        const value = process.env[key];
        return typeof value !== "string" || value.trim() === "";
    });
}

function LogDatabaseConfigurationHelp() {
    console.error(
        'The backend reads "backend/.env".'
    );
    console.error(
        'Check "backend/.env" and make sure DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, and DB_NAME match your local MySQL setup.'
    );
    if (!process.env.DB_PASSWORD) {
        console.error(
            'DB_PASSWORD is currently empty, so MySQL is being contacted without a password ("using password: NO").'
        );
    }
    console.error(
        'Create or update "backend/.env" with your local MySQL credentials.'
    );
}

function ParsePositiveInteger(value) {
    const parsedValue = Number(value);

    if (!Number.isInteger(parsedValue) || parsedValue < 1) {
        return null;
    }

    return parsedValue;
}

function EncodeBase64Url(value) {
    return Buffer.from(value, "utf8").toString("base64url");
}

function DecodeBase64Url(value) {
    try {
        return Buffer.from(value, "base64url");
    } catch {
        return null;
    }
}

function BuildSessionToken({ userType, patronId, staffId }) {
    const issuedAt = Math.floor(Date.now() / 1000);
    const subjectId = userType === "patron" ? patronId : staffId;
    const payload = {
        subjectType: userType,
        subjectId,
        issuedAt,
        expiresAt: issuedAt + sessionMaxAgeSeconds,
    };
    const encodedPayload = EncodeBase64Url(JSON.stringify(payload));
    const signature = crypto
        .createHmac("sha256", sessionSecret)
        .update(encodedPayload)
        .digest("base64url");

    return {
        token: `${encodedPayload}.${signature}`,
        expiresAt: new Date(payload.expiresAt * 1000).toISOString(),
    };
}

function ReadSessionToken(req) {
    const authorizationHeader = String(req.get("authorization") ?? "");
    const match = authorizationHeader.match(/^Bearer\s+(.+)$/i);
    return match ? match[1].trim() : "";
}

function ParseSessionToken(token) {
    if (!token) {
        return null;
    }

    const [encodedPayload, encodedSignature] = token.split(".");

    if (!encodedPayload || !encodedSignature) {
        return null;
    }

    const expectedSignature = crypto
        .createHmac("sha256", sessionSecret)
        .update(encodedPayload)
        .digest();
    const providedSignature = DecodeBase64Url(encodedSignature);

    if (
        !providedSignature ||
        providedSignature.length !== expectedSignature.length ||
        !crypto.timingSafeEqual(expectedSignature, providedSignature)
    ) {
        return null;
    }

    const payloadBuffer = DecodeBase64Url(encodedPayload);

    if (!payloadBuffer) {
        return null;
    }

    let payload;

    try {
        payload = JSON.parse(payloadBuffer.toString("utf8"));
    } catch {
        return null;
    }

    const expiresAt = Number(payload?.expiresAt);
    const subjectId = ParsePositiveInteger(payload?.subjectId);
    const subjectType =
        payload?.subjectType === "patron" || payload?.subjectType === "staff"
            ? payload.subjectType
            : null;

    if (!subjectType || !subjectId || !Number.isFinite(expiresAt)) {
        return null;
    }

    if (expiresAt <= Math.floor(Date.now() / 1000)) {
        return null;
    }

    return subjectType === "patron"
        ? { userType: "patron", patronId: subjectId }
        : { userType: "staff", staffId: subjectId };
}

function HashPassword(password) {
    const normalizedPassword = String(password ?? "");
    const salt = crypto.randomBytes(16).toString("hex");
    const derivedKey = crypto
        .scryptSync(normalizedPassword, salt, 64)
        .toString("hex");

    return `scrypt:${salt}:${derivedKey}`;
}

function IsScryptPasswordHash(value) {
    return typeof value === "string" && value.startsWith("scrypt:");
}

function VerifyScryptPassword(password, storedPasswordHash) {
    const [, salt, storedKeyHex] = String(storedPasswordHash).split(":");

    if (!salt || !storedKeyHex) {
        return false;
    }

    const storedKey = Buffer.from(storedKeyHex, "hex");
    const derivedKey = crypto.scryptSync(String(password ?? ""), salt, 64);

    return (
        storedKey.length === derivedKey.length &&
        crypto.timingSafeEqual(storedKey, derivedKey)
    );
}

async function VerifyPassword(password, storedPasswordHash) {
    if (!storedPasswordHash) {
        return false;
    }

    if (IsScryptPasswordHash(storedPasswordHash)) {
        return VerifyScryptPassword(password, storedPasswordHash);
    }

    return String(password ?? "") === storedPasswordHash;
}

async function UpgradeLegacyPasswordIfNeeded({
    tableName,
    idColumn,
    idValue,
    submittedPassword,
    storedPasswordHash,
}) {
    if (IsScryptPasswordHash(storedPasswordHash)) {
        return;
    }

    const upgradedPasswordHash = HashPassword(submittedPassword);

    await pool.query(
        `
        UPDATE ${tableName}
        SET password_hash = ?
        WHERE ${idColumn} = ?
        `,
        [upgradedPasswordHash, idValue]
    );
}

async function GetRequestUser(req) {
    const sessionUser = ParseSessionToken(ReadSessionToken(req));

    if (!sessionUser) {
        return null;
    }

    if (sessionUser.userType === "patron") {
        const [rows] = await pool.query(
            `
            SELECT
                patron_id AS patronId,
                patron_role_code AS roleCode,
                is_active AS isActive
            FROM patrons
            WHERE patron_id = ?
            `,
            [sessionUser.patronId]
        );

        if (rows.length === 0 || !rows[0].isActive) {
            return null;
        }

        return {
            userType: "patron",
            patronId: rows[0].patronId,
            roleCode: rows[0].roleCode,
        };
    }

    const [rows] = await pool.query(
        `
        SELECT
            staff_id AS staffId,
            staff_role_code AS roleCode,
            is_active AS isActive
        FROM staff
        WHERE staff_id = ?
        `,
        [sessionUser.staffId]
    );

    if (rows.length === 0 || !rows[0].isActive) {
        return null;
    }

    return {
        userType: "staff",
        staffId: rows[0].staffId,
        roleCode: rows[0].roleCode,
    };
}

async function RequireAuthenticatedUser(req, res) {
    const user = await GetRequestUser(req);

    if (!user) {
        res.status(401).json({ error: "Please log in to continue." });
        return null;
    }

    return user;
}

async function RequirePatronUser(req, res) {
    const user = await RequireAuthenticatedUser(req, res);

    if (!user) {
        return null;
    }

    if (user.userType !== "patron" || !user.patronId) {
        res.status(403).json({
            error: "This action is only available to patron accounts.",
        });
        return null;
    }

    return user;
}

async function RequireStaffUser(req, res, { adminOnly = false } = {}) {
    const user = await RequireAuthenticatedUser(req, res);

    if (!user) {
        return null;
    }

    if (user.userType !== "staff" || !user.staffId) {
        res.status(403).json({
            error: "This action is only available to staff accounts.",
        });
        return null;
    }

    if (![1, 2].includes(user.roleCode)) {
        res.status(403).json({ error: "Your staff account does not have access." });
        return null;
    }

    if (adminOnly && user.roleCode !== 2) {
        res.status(403).json({ error: "Only admin accounts can perform this action." });
        return null;
    }

    return user;
}

async function LogDatabaseConnectionStatus() {
    const missingConfigKeys = GetMissingDatabaseConfigKeys();

    if (missingConfigKeys.length > 0) {
        console.error(
            `Database configuration is incomplete. Missing: ${missingConfigKeys.join(", ")}.`
        );
        LogDatabaseConfigurationHelp();
        return;
    }

    try {
        await pool.query("SELECT 1");
        console.log(`Database connection established for "${process.env.DB_NAME}".`);
    } catch (error) {
        console.error(
            `Database connection check failed for "${process.env.DB_NAME}":`,
            error
        );

        if (
            error &&
            typeof error === "object" &&
            "code" in error &&
            error.code === "ER_ACCESS_DENIED_ERROR"
        ) {
            console.error(
                "MySQL rejected the username/password from backend/.env."
            );
            LogDatabaseConfigurationHelp();
        }
    }
}

function BuildSearchQuery({ q, category, availableOnly, sort, limit }) {
    const like = `%${q}%`;
    const availableClause = availableOnly ? " AND i.available > 0" : "";
    const orderBy = searchSorts[sort] ?? searchSorts.title;

    const queries = {
        book: {
            sql: `
                SELECT i.item_id AS itemId, 'book' AS category, b.title,
                    (
                        SELECT GROUP_CONCAT(CONCAT(a.first_name, ' ', a.last_name) SEPARATOR ', ')
                        FROM authors a
                        WHERE a.item_id = b.item_id
                    ) AS creator,
                    bt.book_type AS type,
                    l.language,
                    g.genre,
                    b.summary,
                    b.publisher,
                    b.shelf_number AS shelfNumber,
                    b.publication_date AS publicationDate,
                    NULL AS runtime,
                    i.available,
                    i.on_hold AS onHold,
                    i.unavailable
                FROM items i
                JOIN books b ON b.item_id = i.item_id
                LEFT JOIN book_types bt ON bt.book_type_code = b.book_type_code
                LEFT JOIN languages l ON l.language_code = b.language_code
                LEFT JOIN genres g ON g.genre_code = b.genre_code
                WHERE (
                    b.title LIKE ?
                    OR b.publisher LIKE ?
                    OR b.summary LIKE ?
                    OR EXISTS (
                        SELECT 1
                        FROM authors a
                        WHERE a.item_id = b.item_id
                            AND CONCAT_WS(' ', a.first_name, a.last_name) LIKE ?
                    )
                )${availableClause}
            `,
            params: [like, like, like, like],
        },
        periodical: {
            sql: `
                SELECT i.item_id AS itemId, 'periodical' AS category, p.title,
                    NULL AS creator,
                    pt.periodical_type AS type,
                    l.language,
                    g.genre,
                    p.summary,
                    p.publisher,
                    p.shelf_number AS shelfNumber,
                    p.publication_date AS publicationDate,
                    NULL AS runtime,
                    i.available,
                    i.on_hold AS onHold,
                    i.unavailable
                FROM items i
                JOIN periodicals p ON p.item_id = i.item_id
                LEFT JOIN periodical_types pt ON pt.periodical_type_code = p.periodical_type_code
                LEFT JOIN languages l ON l.language_code = p.language_code
                LEFT JOIN genres g ON g.genre_code = p.genre_code
                WHERE (
                    p.title LIKE ?
                    OR p.publisher LIKE ?
                    OR p.summary LIKE ?
                )${availableClause}
            `,
            params: [like, like, like],
        },
        audiovisualmedia: {
            sql: `
                SELECT i.item_id AS itemId, 'audiovisualmedia' AS category, am.title,
                    (
                        SELECT CONCAT(c.first_name, ' ', c.last_name)
                        FROM contributors c
                        WHERE c.item_id = am.item_id
                    ) AS creator,
                    amt.audiovisual_media_type AS type,
                    l.language,
                    g.genre,
                    am.summary,
                    am.publisher,
                    am.shelf_number AS shelfNumber,
                    am.publication_date AS publicationDate,
                    am.runtime,
                    i.available,
                    i.on_hold AS onHold,
                    i.unavailable
                FROM items i
                JOIN audiovisual_media am ON am.item_id = i.item_id
                LEFT JOIN audiovisual_media_types amt
                    ON amt.audiovisual_media_type_code = am.audiovisual_media_type_code
                LEFT JOIN languages l ON l.language_code = am.language_code
                LEFT JOIN genres g ON g.genre_code = am.genre_code
                WHERE (
                    am.title LIKE ?
                    OR am.publisher LIKE ?
                    OR am.summary LIKE ?
                    OR EXISTS (
                        SELECT 1
                        FROM contributors c
                        WHERE c.item_id = am.item_id
                            AND CONCAT_WS(' ', c.first_name, c.last_name) LIKE ?
                    )
                )${availableClause}
            `,
            params: [like, like, like, like],
        },
        equipment: {
            sql: `
                SELECT i.item_id AS itemId, 'equipment' AS category,
                    e.equipment_name AS title,
                    NULL AS creator,
                    NULL AS type,
                    NULL AS language,
                    NULL AS genre,
                    NULL AS summary,
                    NULL AS publisher,
                    NULL AS shelfNumber,
                    NULL AS publicationDate,
                    NULL AS runtime,
                    i.available,
                    i.on_hold AS onHold,
                    i.unavailable
                FROM items i
                JOIN equipment e ON e.item_id = i.item_id
                WHERE e.equipment_name LIKE ?${availableClause}
            `,
            params: [like],
        },
    };

    const normalizedCategory = category === "audiovisual_media"
        ? "audiovisualmedia"
        : category;
    const chosenQueries = normalizedCategory !== "all" && queries[normalizedCategory]
        ? [queries[normalizedCategory]]
        : Object.values(queries);

    return {
        sql: `
            SELECT *
            FROM (
                ${chosenQueries.map((query) => query.sql).join(" UNION ALL ")}
            ) AS results
            ORDER BY ${orderBy}
            LIMIT ?
        `,
        params: [...chosenQueries.flatMap((query) => query.params), limit],
    };
}

app.get(["/account", "/api/account"], async (req, res) => {
    try {
        const user = await RequireAuthenticatedUser(req, res);

        if (!user) {
            return;
        }

        if (user.userType === "patron") {
            const [rows] = await pool.query(
                `
                SELECT
                    patron_id,
                    NULL AS staff_id,
                    patron_role_code AS role,
                    'patron' AS user_type,
                    first_name,
                    last_name,
                    date_of_birth,
                    email,
                    is_active,
                    NULL AS phone_number,
                    NULL AS address
                FROM patrons
                WHERE patron_id = ?
                `,
                [user.patronId]
            );

            if (rows.length === 0) {
                return res.status(404).json({ error: "Patron not found" });
            }

            return res.json(rows[0]);
        }

        const [rows] = await pool.query(
            `
            SELECT
                NULL AS patron_id,
                staff_id,
                staff_role_code AS role,
                'staff' AS user_type,
                first_name,
                last_name,
                date_of_birth,
                email,
                is_active,
                phone_number,
                address
            FROM staff
            WHERE staff_id = ?
            `,
            [user.staffId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Staff account not found" });
        }

        res.json(rows[0]);
    } catch (error) {
        SendServerError(res, error, "Internal Server Error");
    }
});

// Fines endpoint
app.get(["/fines", "/api/fines"], async (req, res) => {
  try {
    const user = await RequireAuthenticatedUser(req, res);

    if (!user) {
      return;
    }

    if (user.userType !== "patron") {
      return res.status(403).json({ error: "Only patrons can access fines." });
    }

    const currentFineRows = await GetCurrentFineRows(user.patronId);

    const [recordedFines] = await pool.query(
      `
      SELECT
        fine_id AS fineId,
        fine_amount AS amount,
        fine_date AS assignedDate,
        paid_date AS paidDate,
        waived_date AS waivedDate,
        CASE
          WHEN waived_date IS NOT NULL THEN 'waived'
          WHEN paid_date IS NOT NULL THEN 'paid'
          ELSE 'unpaid'
        END AS status,
        NULL AS title,
        NULL AS daysOverdue,
        NULL AS dailyFine,
        NULL AS loanId
      FROM fines
      WHERE patron_id = ?
      ORDER BY fine_date DESC, fine_id DESC
      `,
      [user.patronId]
    );

    const currentFines = currentFineRows.map((row) => ({
      fineId: null,
      amount: row.currentFine,
      assignedDate: row.loanDueDate,
      paidDate: null,
      waivedDate: null,
      status: "current",
      title: row.title,
      daysOverdue: row.daysOverdue,
      dailyFine: row.dailyFine,
      loanId: row.loanId,
    }));

    return res.json([...currentFines, ...recordedFines]);
  } catch (error) {
    SendServerError(res, error, "Internal Server Error");
  }
});

// Loans and Holds endpoint
app.get(["/loans", "/api/loans"], async (req, res) => {
  try {
    const user = await RequirePatronUser(req, res);

    if (!user) {
      return;
    }

    const [loans] = await pool.query(
      `
      SELECT * FROM (
        SELECT
          l.loan_id AS loanId,
          l.item_id AS itemId,
          'book' AS category,
          b.title AS title,
          (
            SELECT GROUP_CONCAT(CONCAT(a.first_name, ' ', a.last_name) SEPARATOR ', ')
            FROM authors a
            WHERE a.item_id = b.item_id
          ) AS creator,
          bt.book_type AS type,
          lang.language AS language,
          g.genre AS genre,
          b.summary AS summary,
          b.publisher AS publisher,
          b.shelf_number AS shelfNumber,
          b.publication_date AS publicationDate,
          NULL AS runtime,
          l.loan_origin_date AS loanStart,
          l.loan_due_date AS loanEnd,
          l.loan_due_date < CURDATE() AS overdue
        FROM loans l
        JOIN books b ON b.item_id = l.item_id
        LEFT JOIN book_types bt ON bt.book_type_code = b.book_type_code
        LEFT JOIN languages lang ON lang.language_code = b.language_code
        LEFT JOIN genres g ON g.genre_code = b.genre_code
        WHERE l.patron_id = ?

        UNION ALL

        SELECT
          l.loan_id AS loanId,
          l.item_id AS itemId,
          'periodical' AS category,
          p.title AS title,
          NULL AS creator,
          pt.periodical_type AS type,
          lang.language AS language,
          g.genre AS genre,
          p.summary AS summary,
          p.publisher AS publisher,
          p.shelf_number AS shelfNumber,
          p.publication_date AS publicationDate,
          NULL AS runtime,
          l.loan_origin_date AS loanStart,
          l.loan_due_date AS loanEnd,
          l.loan_due_date < CURDATE() AS overdue
        FROM loans l
        JOIN periodicals p ON p.item_id = l.item_id
        LEFT JOIN periodical_types pt ON pt.periodical_type_code = p.periodical_type_code
        LEFT JOIN languages lang ON lang.language_code = p.language_code
        LEFT JOIN genres g ON g.genre_code = p.genre_code
        WHERE l.patron_id = ?

        UNION ALL

        SELECT
          l.loan_id AS loanId,
          l.item_id AS itemId,
          'audiovisualmedia' AS category,
          am.title AS title,
          (
            SELECT GROUP_CONCAT(CONCAT(c.first_name, ' ', c.last_name) SEPARATOR ', ')
            FROM contributors c
            WHERE c.item_id = am.item_id
          ) AS creator,
          amt.audiovisual_media_type AS type,
          lang.language AS language,
          g.genre AS genre,
          am.summary AS summary,
          am.publisher AS publisher,
          am.shelf_number AS shelfNumber,
          am.publication_date AS publicationDate,
          am.runtime AS runtime,
          l.loan_origin_date AS loanStart,
          l.loan_due_date AS loanEnd,
          l.loan_due_date < CURDATE() AS overdue
        FROM loans l
        JOIN audiovisual_media am ON am.item_id = l.item_id
        LEFT JOIN audiovisual_media_types amt
          ON amt.audiovisual_media_type_code = am.audiovisual_media_type_code
        LEFT JOIN languages lang ON lang.language_code = am.language_code
        LEFT JOIN genres g ON g.genre_code = am.genre_code
        WHERE l.patron_id = ?

        UNION ALL

        SELECT
          l.loan_id AS loanId,
          l.item_id AS itemId,
          'equipment' AS category,
          e.equipment_name AS title,
          NULL AS creator,
          NULL AS type,
          NULL AS language,
          NULL AS genre,
          NULL AS summary,
          NULL AS publisher,
          NULL AS shelfNumber,
          NULL AS publicationDate,
          NULL AS runtime,
          l.loan_origin_date AS loanStart,
          l.loan_due_date AS loanEnd,
          l.loan_due_date < CURDATE() AS overdue
        FROM loans l
        JOIN equipment e ON e.item_id = l.item_id
        WHERE l.patron_id = ?
      ) AS patron_loans
      ORDER BY loanEnd ASC
      `,
      [user.patronId, user.patronId, user.patronId, user.patronId]
    );

    const [holds] = await pool.query(
      `
      SELECT * FROM (
        SELECT
          h.hold_id AS holdId,
          h.item_id AS itemId,
          'book' AS category,
          b.title AS title,
          (
            SELECT GROUP_CONCAT(CONCAT(a.first_name, ' ', a.last_name) SEPARATOR ', ')
            FROM authors a
            WHERE a.item_id = b.item_id
          ) AS creator,
          bt.book_type AS type,
          lang.language AS language,
          g.genre AS genre,
          b.summary AS summary,
          b.publisher AS publisher,
          b.shelf_number AS shelfNumber,
          b.publication_date AS publicationDate,
          NULL AS runtime,
          h.hold_origin_date AS holdStart,
          h.hold_expiration_date AS holdEnd,
          COALESCE(LOWER(hs.hold_status_name), '') = 'ready' AS ready
        FROM holds h
        LEFT JOIN hold_statuses hs ON hs.hold_status_code = h.hold_status_code
        JOIN books b ON b.item_id = h.item_id
        LEFT JOIN book_types bt ON bt.book_type_code = b.book_type_code
        LEFT JOIN languages lang ON lang.language_code = b.language_code
        LEFT JOIN genres g ON g.genre_code = b.genre_code
        WHERE h.patron_id = ?

        UNION ALL

        SELECT
          h.hold_id AS holdId,
          h.item_id AS itemId,
          'periodical' AS category,
          p.title AS title,
          NULL AS creator,
          pt.periodical_type AS type,
          lang.language AS language,
          g.genre AS genre,
          p.summary AS summary,
          p.publisher AS publisher,
          p.shelf_number AS shelfNumber,
          p.publication_date AS publicationDate,
          NULL AS runtime,
          h.hold_origin_date AS holdStart,
          h.hold_expiration_date AS holdEnd,
          COALESCE(LOWER(hs.hold_status_name), '') = 'ready' AS ready
        FROM holds h
        LEFT JOIN hold_statuses hs ON hs.hold_status_code = h.hold_status_code
        JOIN periodicals p ON p.item_id = h.item_id
        LEFT JOIN periodical_types pt ON pt.periodical_type_code = p.periodical_type_code
        LEFT JOIN languages lang ON lang.language_code = p.language_code
        LEFT JOIN genres g ON g.genre_code = p.genre_code
        WHERE h.patron_id = ?

        UNION ALL

        SELECT
          h.hold_id AS holdId,
          h.item_id AS itemId,
          'audiovisualmedia' AS category,
          am.title AS title,
          (
            SELECT GROUP_CONCAT(CONCAT(c.first_name, ' ', c.last_name) SEPARATOR ', ')
            FROM contributors c
            WHERE c.item_id = am.item_id
          ) AS creator,
          amt.audiovisual_media_type AS type,
          lang.language AS language,
          g.genre AS genre,
          am.summary AS summary,
          am.publisher AS publisher,
          am.shelf_number AS shelfNumber,
          am.publication_date AS publicationDate,
          am.runtime AS runtime,
          h.hold_origin_date AS holdStart,
          h.hold_expiration_date AS holdEnd,
          COALESCE(LOWER(hs.hold_status_name), '') = 'ready' AS ready
        FROM holds h
        LEFT JOIN hold_statuses hs ON hs.hold_status_code = h.hold_status_code
        JOIN audiovisual_media am ON am.item_id = h.item_id
        LEFT JOIN audiovisual_media_types amt
          ON amt.audiovisual_media_type_code = am.audiovisual_media_type_code
        LEFT JOIN languages lang ON lang.language_code = am.language_code
        LEFT JOIN genres g ON g.genre_code = am.genre_code
        WHERE h.patron_id = ?

        UNION ALL

        SELECT
          h.hold_id AS holdId,
          h.item_id AS itemId,
          'equipment' AS category,
          e.equipment_name AS title,
          NULL AS creator,
          NULL AS type,
          NULL AS language,
          NULL AS genre,
          NULL AS summary,
          NULL AS publisher,
          NULL AS shelfNumber,
          NULL AS publicationDate,
          NULL AS runtime,
          h.hold_origin_date AS holdStart,
          h.hold_expiration_date AS holdEnd,
          COALESCE(LOWER(hs.hold_status_name), '') = 'ready' AS ready
        FROM holds h
        LEFT JOIN hold_statuses hs ON hs.hold_status_code = h.hold_status_code
        JOIN equipment e ON e.item_id = h.item_id
        WHERE h.patron_id = ?
      ) AS patron_holds
      ORDER BY holdEnd ASC
      `,
      [user.patronId, user.patronId, user.patronId, user.patronId]
    );

    res.json({ loans, holds });
  } catch (error) {
    SendServerError(res, error, "Internal Server Error");
  }
});

app.get(["/search", "/api/search"], async (req, res) => {
    const q = String(req.query.q ?? "").trim();
    const category = String(req.query.category ?? "all").toLowerCase();
    const availableOnly = String(req.query.availableOnly ?? "false") === "true";
    const sort = String(req.query.sort ?? "title").toLowerCase();
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);

    try {
      await ClearExpiredHolds();
        const { sql, params } = BuildSearchQuery({
            q,
            category,
            availableOnly,
            sort,
            limit,
        });

        const [rows] = await pool.query(sql, params);

        res.json({
            query: { q, category, availableOnly, sort, limit },
            count: rows.length,
            results: rows,
        });
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({
            error: FormatServerError(error, "Internal Server Error"),
        });
    }
});



// Login endpoint
app.post(["/login", "/api/login"], async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. try to find patrons first
    const [patronUsers] = await pool.query(
      "SELECT * FROM patrons WHERE email = ?",
      [email]
    );

    if (patronUsers.length > 0) {
      const user = patronUsers[0];

      if (!user.is_active) {
        return res.status(403).json({ error: "Account is inactive" });
      }

      const passwordMatches = await VerifyPassword(password, user.password_hash);

      if (!passwordMatches) {
        return res.status(401).json({ error: "Invalid password" });
      }

      await UpgradeLegacyPasswordIfNeeded({
        tableName: "patrons",
        idColumn: "patron_id",
        idValue: user.patron_id,
        submittedPassword: password,
        storedPasswordHash: user.password_hash,
      });
      const session = BuildSessionToken({
        userType: "patron",
        patronId: user.patron_id,
      });

      return res.json({
        message: "Login successful",
        sessionToken: session.token,
        sessionExpiresAt: session.expiresAt,
        user: {
          user_type: "patron",
          patron_id: user.patron_id,
          role: user.patron_role_code,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
        },
      });
    }

    // 2. patrons not found, then find staff
    const [staffUsers] = await pool.query(
      "SELECT * FROM staff WHERE email = ?",
      [email]
    );

    if (staffUsers.length > 0) {
      const user = staffUsers[0];

      if (!user.is_active) {
        return res.status(403).json({ error: "Account is inactive" });
      }

      const passwordMatches = await VerifyPassword(password, user.password_hash);

      if (!passwordMatches) {
        return res.status(401).json({ error: "Invalid password" });
      }

      await UpgradeLegacyPasswordIfNeeded({
        tableName: "staff",
        idColumn: "staff_id",
        idValue: user.staff_id,
        submittedPassword: password,
        storedPasswordHash: user.password_hash,
      });
      const session = BuildSessionToken({
        userType: "staff",
        staffId: user.staff_id,
      });

      return res.json({
        message: "Login successful",
        sessionToken: session.token,
        sessionExpiresAt: session.expiresAt,
        user: {
          user_type: "staff",
          staff_id: user.staff_id,
          role: user.staff_role_code,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
        },
      });
    }

    return res.status(401).json({ error: "User not found" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: FormatServerError(error, "Login failed"),
    });
  }
});


// Registration endpoint
app.post(["/register", "/api/register"], async (req, res) => {
  try {
    const { firstname, lastname, birthday, email, password } = req.body;

    if (!firstname || !lastname || !email || !password) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const [existingPatrons] = await pool.query(
      "SELECT patron_id FROM patrons WHERE email = ?",
      [email]
    );

    if (existingPatrons.length > 0) {
      return res.status(409).json({ error: "Email already registered." });
    }

    const passwordHash = HashPassword(password);

    await pool.query(
      `
      INSERT INTO patrons
        (patron_role_code, first_name, last_name, date_of_birth, email, password_hash, is_active)
      VALUES
        (?, ?, ?, ?, ?, ?, ?)
      `,
      [1, firstname, lastname, birthday || null, email, passwordHash, 1]
    );

    res.status(201).json({ message: "Registration successful." });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      error: FormatServerError(error, "Registration failed."),
    });
  }
});


// Admin creates staff signup_code endpoint
app.post(["/staff-signup-codes", "/api/staff-signup-codes"], async (req, res) => {
  try {
    const user = await RequireStaffUser(req, res, { adminOnly: true });

    if (!user) {
      return;
    }

    const { signup_code, staff_role_code } = req.body;
    const normalizedStaffRoleCode = ParsePositiveInteger(staff_role_code);

    if (!signup_code || !normalizedStaffRoleCode) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    if (![1, 2].includes(normalizedStaffRoleCode)) {
      return res.status(400).json({ error: "staff_role_code must be 1 or 2." });
    }

    // check if the signup code already exists
    const [existingCodes] = await pool.query(
      "SELECT code_id FROM staff_signup_codes WHERE signup_code = ?",
      [signup_code]
    );

    if (existingCodes.length > 0) {
      return res.status(409).json({ error: "Signup code already exists." });
    }

    await pool.query(
      `
      INSERT INTO staff_signup_codes
        (signup_code, staff_role_code, created_by_admin_id, is_used)
      VALUES
        (?, ?, ?, ?)
      `,
      [signup_code, normalizedStaffRoleCode, user.staffId, 0]
    );

    res.status(201).json({ message: "Signup code created successfully." });
  } catch (error) {
    console.error("Create signup code error:", error);
    res.status(500).json({
      error: FormatServerError(error, "Failed to create signup code."),
    });
  }
});

app.post(["/staff/register", "/api/staff/register"], async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      birthday,
      email,
      password,
      phone_number,
      address,
      signup_code,
    } = req.body;

    if (
      !firstname ||
      !lastname ||
      !email ||
      !password ||
      !birthday ||
      !address ||
      !signup_code
    ) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    //  check signup code
    const [codes] = await pool.query(
      `
      SELECT *
      FROM staff_signup_codes
      WHERE signup_code = ? AND is_used = 0
      `,
      [signup_code]
    );

    if (codes.length === 0) {
      return res.status(400).json({ error: "Invalid or already used signup code." });
    }

    const codeRecord = codes[0];

    // check email
    const [existingStaff] = await pool.query(
      "SELECT staff_id FROM staff WHERE email = ?",
      [email]
    );

    if (existingStaff.length > 0) {
      return res.status(409).json({ error: "Email already registered." });
    }

    const passwordHash = HashPassword(password);

    //create staff account
    await pool.query(
      `
      INSERT INTO staff
        (
          staff_role_code,
          first_name,
          last_name,
          date_of_birth,
          email,
          phone_number,
          address,
          password_hash,
          is_active
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        codeRecord.staff_role_code,
        firstname,
        lastname,
        birthday,
        email,
        phone_number || null,
        address,
        passwordHash,
        1,
      ]
    );

    // mark the signup code as used
    await pool.query(
      `
      UPDATE staff_signup_codes
      SET is_used = 1
      WHERE code_id = ?
      `,
      [codeRecord.code_id]
    );

    res.status(201).json({ message: "Staff registration successful." });
  } catch (error) {
    console.error("Staff registration error:", error);
    res.status(500).json({
      error: FormatServerError(error, "Staff registration failed."),
    });
  }
});


// Place hold endpoint
app.post(["/holds", "/api/holds"], async (req, res) => {
  try {
    await ClearExpiredHolds();
    const user = await RequireAuthenticatedUser(req, res);

    if (!user) {
      return;
    }

    const itemId = ParsePositiveInteger(req.body?.item_id);
    const requestedPatronId = ParsePositiveInteger(req.body?.patron_id);

    if (!itemId) {
      return res.status(400).json({ error: "A valid item_id is required." });
    }

    let patronId = null;

    if (user.userType === "patron") {
      if (requestedPatronId && requestedPatronId !== user.patronId) {
        return res.status(403).json({
          error: "Patrons can only place holds for their own account.",
        });
      }

      patronId = user.patronId;
    } else if (user.userType === "staff" && [1, 2].includes(user.roleCode)) {
      if (!requestedPatronId) {
        return res.status(400).json({
          error: "Staff must provide a patron_id when placing a hold.",
        });
      }

      patronId = requestedPatronId;
    } else {
      return res.status(403).json({
        error: "This action is only available to patron or staff accounts.",
      });
    }

    const [patrons] = await pool.query(
      `
      SELECT patron_id
      FROM patrons
      WHERE patron_id = ? AND is_active = 1
      `,
      [patronId]
    );

    if (patrons.length === 0) {
      return res.status(404).json({ error: "Patron not found." });
    }

    const [items] = await pool.query(
      "SELECT * FROM items WHERE item_id = ?",
      [itemId]
    );

    if (items.length === 0) {
      return res.status(404).json({ error: "Item not found." });
    }

    const item = items[0];

    if (item.available < 1) {
      return res.status(400).json({ error: "No available copies for hold." });
    }

    await pool.query(
      `
      INSERT INTO holds
        (item_id, patron_id, hold_origin_date, hold_expiration_date, hold_status_code)
      VALUES
        (?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 2 DAY), ?)
      `,
      [itemId, patronId, 1]
    );

    await pool.query(
      `
      UPDATE items
      SET available = available - 1,
          on_hold = on_hold + 1
      WHERE item_id = ?
      `,
      [itemId]
    );

    return res.status(201).json({ message: "Hold placed successfully." });
  } catch (error) {
    console.error("Place hold error:", error);
    return res.status(500).json({
      error: FormatServerError(error, "Failed to place hold."),
    });
  }
});

void LogDatabaseConnectionStatus();

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});

// Function to clear expired holds and update item availability
async function ClearExpiredHolds() {
    const [expiredHolds] = await pool.query(
        `
        SELECT hold_id AS holdId, item_id AS itemId
        FROM holds
        WHERE hold_expiration_date < CURDATE()
        `
    );

    for (const hold of expiredHolds) {
        await pool.query(
            `
            UPDATE items
            SET available = available + 1,
                on_hold = CASE WHEN on_hold > 0 THEN on_hold - 1 ELSE 0 END
            WHERE item_id = ?
            `,
            [hold.itemId]
        );

        await pool.query(
            `
            DELETE FROM holds
            WHERE hold_id = ?
            `,
            [hold.holdId]
        );
    }
}

// Get current holds for staff view
app.get(["/holds/current", "/api/holds/current"], async (req, res) => {
  try {
    const user = await RequireStaffUser(req, res);

    if (!user) {
      return;
    }

    await ClearExpiredHolds();

    const [rows] = await pool.query(
      `
      SELECT
        h.hold_id AS holdId,
        h.item_id AS itemId,
        h.patron_id AS patronId,
        h.hold_origin_date AS holdStart,
        h.hold_expiration_date AS holdEnd,
        p.first_name,
        p.last_name,
        COALESCE(
          b.title,
          per.title,
          am.title,
          e.equipment_name
        ) AS title,
        COALESCE(
          (
            SELECT GROUP_CONCAT(CONCAT(a.first_name, ' ', a.last_name) SEPARATOR ', ')
            FROM authors a
            WHERE a.item_id = b.item_id
          ),
          (
            SELECT GROUP_CONCAT(CONCAT(c.first_name, ' ', c.last_name) SEPARATOR ', ')
            FROM contributors c
            WHERE c.item_id = am.item_id
          ),
          NULL
        ) AS creator
      FROM holds h
      JOIN patrons p ON p.patron_id = h.patron_id
      LEFT JOIN books b ON b.item_id = h.item_id
      LEFT JOIN periodicals per ON per.item_id = h.item_id
      LEFT JOIN audiovisual_media am ON am.item_id = h.item_id
      LEFT JOIN equipment e ON e.item_id = h.item_id
      ORDER BY h.hold_expiration_date ASC, h.hold_id ASC
      `
    );

    const formattedRows = rows.map((row) => ({
      ...row,
      patronName: `${row.first_name} ${row.last_name}`,
    }));

    return res.json(formattedRows);
  } catch (error) {
    console.error("Load current holds error:", error);
    return res.status(500).json({
      error: FormatServerError(error, "Failed to load holds."),
    });
  }
});

// Cancel hold endpoint
app.delete(["/holds/:holdId", "/api/holds/:holdId"], async (req, res) => {
  try {
    const user = await RequireAuthenticatedUser(req, res);

    if (!user) {
      return;
    }

    await ClearExpiredHolds();

    const holdId = ParsePositiveInteger(req.params.holdId);

    if (!holdId) {
      return res.status(400).json({ error: "A valid holdId is required." });
    }

    const [holds] = await pool.query(
      `
      SELECT hold_id AS holdId, item_id AS itemId, patron_id AS patronId
      FROM holds
      WHERE hold_id = ?
      `,
      [holdId]
    );

    if (holds.length === 0) {
      return res.status(404).json({ error: "Hold not found." });
    }

    const hold = holds[0];

    if (user.userType === "patron" && hold.patronId !== user.patronId) {
      return res.status(403).json({
        error: "Patrons can only cancel their own holds.",
      });
    }

    if (user.userType === "staff" && ![1, 2].includes(user.roleCode)) {
      return res.status(403).json({ error: "Your staff account does not have access." });
    }

    await pool.query(
      `
      DELETE FROM holds
      WHERE hold_id = ?
      `,
      [holdId]
    );

    await pool.query(
      `
      UPDATE items
      SET available = available + 1,
          on_hold = CASE WHEN on_hold > 0 THEN on_hold - 1 ELSE 0 END
      WHERE item_id = ?
      `,
      [hold.itemId]
    );

    return res.json({ message: "Hold cancelled successfully." });
  } catch (error) {
    console.error("Cancel hold error:", error);
    return res.status(500).json({
      error: FormatServerError(error, "Failed to cancel hold."),
    });
  }
});

// Checkout hold endpoint
app.post(["/holds/:holdId/checkout", "/api/holds/:holdId/checkout"], async (req, res) => {
  try {
    const user = await RequireStaffUser(req, res);

    if (!user) {
      return;
    }

    await ClearExpiredHolds();

    const holdId = ParsePositiveInteger(req.params.holdId);

    if (!holdId) {
      return res.status(400).json({ error: "A valid holdId is required." });
    }

    const [holds] = await pool.query(
      `
      SELECT
        h.hold_id AS holdId,
        h.item_id AS itemId,
        h.patron_id AS patronId,
        p.patron_role_code AS patronRoleCode,
        pr.loan_period AS loanPeriod
      FROM holds h
      JOIN patrons p ON p.patron_id = h.patron_id
      JOIN patron_roles pr ON pr.patron_role_code = p.patron_role_code
      WHERE h.hold_id = ?
      `,
      [holdId]
    );

    if (holds.length === 0) {
      return res.status(404).json({ error: "Hold not found." });
    }

    const hold = holds[0];

    await pool.query(
      `
      INSERT INTO loans
        (item_id, patron_id, loan_origin_date, loan_due_date, patron_role_code, loan_status_code)
      VALUES
        (?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL ? DAY), ?, ?)
      `,
      [hold.itemId, hold.patronId, hold.loanPeriod, hold.patronRoleCode, 1]
    );

    await pool.query(
      `
      DELETE FROM holds
      WHERE hold_id = ?
      `,
      [holdId]
    );

    await pool.query(
      `
      UPDATE items
      SET on_hold = CASE WHEN on_hold > 0 THEN on_hold - 1 ELSE 0 END,
          unavailable = unavailable + 1
      WHERE item_id = ?
      `,
      [hold.itemId]
    );

    return res.json({ message: "Hold checked out successfully." });
  } catch (error) {
    console.error("Checkout hold error:", error);
    return res.status(500).json({
      error: FormatServerError(error, "Failed to check out hold."),
    });
  }
});

// Direct checkout endpoint (without hold)
app.post(["/checkout", "/api/checkout"], async (req, res) => {
  try {
    const user = await RequireStaffUser(req, res);

    if (!user) {
      return;
    }

    await ClearExpiredHolds();

    const itemId = ParsePositiveInteger(req.body?.item_id);
    const patronId = ParsePositiveInteger(req.body?.patron_id);

    if (!itemId || !patronId) {
      return res.status(400).json({ error: "A valid item_id and patron_id are required." });
    }

    const [patrons] = await pool.query(
      `
      SELECT
        p.patron_id AS patronId,
        p.patron_role_code AS patronRoleCode,
        pr.loan_period AS loanPeriod
      FROM patrons p
      JOIN patron_roles pr ON pr.patron_role_code = p.patron_role_code
      WHERE p.patron_id = ? AND p.is_active = 1
      `,
      [patronId]
    );

    if (patrons.length === 0) {
      return res.status(404).json({ error: "Patron not found." });
    }

    const patron = patrons[0];

    const [items] = await pool.query(
      `
      SELECT item_id AS itemId, available
      FROM items
      WHERE item_id = ?
      `,
      [itemId]
    );

    if (items.length === 0) {
      return res.status(404).json({ error: "Item not found." });
    }

    const item = items[0];

    if (item.available < 1) {
      return res.status(400).json({ error: "No available copies for checkout." });
    }

    await pool.query(
      `
      INSERT INTO loans
        (item_id, patron_id, loan_origin_date, loan_due_date, patron_role_code, loan_status_code)
      VALUES
        (?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL ? DAY), ?, ?)
      `,
      [itemId, patron.patronId, patron.loanPeriod, patron.patronRoleCode, 1]
    );

    await pool.query(
      `
      UPDATE items
      SET available = available - 1,
          unavailable = unavailable + 1
      WHERE item_id = ?
      `,
      [itemId]
    );

    return res.status(201).json({ message: "Checkout successful." });
  } catch (error) {
    console.error("Direct checkout error:", error);
    return res.status(500).json({
      error: FormatServerError(error, "Failed to check out item."),
    });
  }
});

// Get current loans for staff view
app.get(["/staff/loans/current", "/api/staff/loans/current"], async (req, res) => {
  try {
    const user = await RequireStaffUser(req, res);
    

    if (!user) {
      return;
    }

    await ClearExpiredHolds();

    const [rows] = await pool.query(
      `
      SELECT
        l.loan_id AS loanId,
        l.item_id AS itemId,
        l.patron_id AS patronId,
        l.loan_origin_date AS loanStart,
        l.loan_due_date AS loanEnd,
        p.first_name,
        p.last_name,
        COALESCE(
          b.title,
          per.title,
          am.title,
          e.equipment_name
        ) AS title,
        COALESCE(
          (
            SELECT GROUP_CONCAT(CONCAT(a.first_name, ' ', a.last_name) SEPARATOR ', ')
            FROM authors a
            WHERE a.item_id = b.item_id
          ),
          (
            SELECT GROUP_CONCAT(CONCAT(c.first_name, ' ', c.last_name) SEPARATOR ', ')
            FROM contributors c
            WHERE c.item_id = am.item_id
          ),
          NULL
        ) AS creator
      FROM loans l
      JOIN patrons p ON p.patron_id = l.patron_id
      LEFT JOIN books b ON b.item_id = l.item_id
      LEFT JOIN periodicals per ON per.item_id = l.item_id
      LEFT JOIN audiovisual_media am ON am.item_id = l.item_id
      LEFT JOIN equipment e ON e.item_id = l.item_id
      WHERE l.loan_status_code = 1
      ORDER BY l.loan_due_date ASC, l.loan_id ASC
      `
    );

    const formattedRows = rows.map((row) => ({
      ...row,
      patronName: `${row.first_name} ${row.last_name}`,
    }));

    return res.json(formattedRows);
  } catch (error) {
    console.error("Load current staff loans error:", error);
    return res.status(500).json({
      error: FormatServerError(error, "Failed to load staff loans."),
    });
  }
});

// Return loan endpoint
app.post(["/loans/:loanId/return", "/api/loans/:loanId/return"], async (req, res) => {
  try {
    const user = await RequireStaffUser(req, res);

    if (!user) {
      return;
    }

    const loanId = ParsePositiveInteger(req.params.loanId);

    if (!loanId) {
      return res.status(400).json({ error: "A valid loanId is required." });
    }

    const [loans] = await pool.query(
      `
      SELECT
        l.loan_id AS loanId,
        l.item_id AS itemId,
        l.patron_id AS patronId,
        l.loan_status_code AS loanStatusCode,
        l.loan_due_date AS loanDueDate,
        pr.fine AS dailyFine
      FROM loans l
      JOIN patron_roles pr ON pr.patron_role_code = l.patron_role_code
      WHERE l.loan_id = ?
      `,
      [loanId]
    );

    if (loans.length === 0) {
      return res.status(404).json({ error: "Loan not found." });
    }

    const loan = loans[0];

    if (loan.loanStatusCode !== 1) {
      return res.status(400).json({ error: "Only active loans can be returned." });
    }

    const [daysOverdueRows] = await pool.query(
      `
      SELECT GREATEST(DATEDIFF(CURDATE(), ?), 0) AS daysOverdue
      `,
      [loan.loanDueDate]
    );

    const daysOverdue = Number(daysOverdueRows[0]?.daysOverdue ?? 0);
    const fineAmount = Number((daysOverdue * Number(loan.dailyFine)).toFixed(2));

    if (fineAmount > 0) {
      await pool.query(
        `
        INSERT INTO fines
          (patron_id, fine_amount, fine_date)
        VALUES
          (?, ?, CURDATE())
        `,
        [loan.patronId, fineAmount]
      );
    }

    await pool.query(
      `
      UPDATE loans
      SET loan_status_code = 2
      WHERE loan_id = ?
      `,
      [loanId]
    );

    await pool.query(
      `
      UPDATE items
      SET unavailable = CASE WHEN unavailable > 0 THEN unavailable - 1 ELSE 0 END,
          available = available + 1
      WHERE item_id = ?
      `,
      [loan.itemId]
    );

    return res.json({
      message: "Loan returned successfully.",
      fineAmount,
      daysOverdue,
    });
  } catch (error) {
    console.error("Return loan error:", error);
    return res.status(500).json({
      error: FormatServerError(error, "Failed to return loan."),
    });
  }
});

// Get current fines for a specific patron (used for both staff and patron views)
async function GetCurrentFineRows(optionalPatronId = null) {
  const patronClause = optionalPatronId ? " AND l.patron_id = ?" : "";

  const [rows] = await pool.query(
    `
    SELECT
      l.loan_id AS loanId,
      l.item_id AS itemId,
      l.patron_id AS patronId,
      l.loan_origin_date AS loanStart,
      l.loan_due_date AS loanDueDate,
      p.first_name AS firstName,
      p.last_name AS lastName,
      pr.fine AS dailyFine,
      DATEDIFF(CURDATE(), l.loan_due_date) AS daysOverdue,
      ROUND(DATEDIFF(CURDATE(), l.loan_due_date) * pr.fine, 2) AS currentFine,
      COALESCE(
        b.title,
        per.title,
        am.title,
        e.equipment_name
      ) AS title,
      COALESCE(
        (
          SELECT GROUP_CONCAT(CONCAT(a.first_name, ' ', a.last_name) SEPARATOR ', ')
          FROM authors a
          WHERE a.item_id = b.item_id
        ),
        (
          SELECT GROUP_CONCAT(CONCAT(c.first_name, ' ', c.last_name) SEPARATOR ', ')
          FROM contributors c
          WHERE c.item_id = am.item_id
        ),
        NULL
      ) AS creator
    FROM loans l
    JOIN patrons p ON p.patron_id = l.patron_id
    JOIN patron_roles pr ON pr.patron_role_code = l.patron_role_code
    LEFT JOIN books b ON b.item_id = l.item_id
    LEFT JOIN periodicals per ON per.item_id = l.item_id
    LEFT JOIN audiovisual_media am ON am.item_id = l.item_id
    LEFT JOIN equipment e ON e.item_id = l.item_id
    WHERE l.loan_status_code = 1
      AND l.loan_due_date < CURDATE()
      AND pr.fine > 0
      ${patronClause}
    ORDER BY currentFine DESC, l.loan_due_date ASC, l.loan_id ASC
    `,
    optionalPatronId ? [optionalPatronId] : []
  );

  return rows.map((row) => ({
    ...row,
    patronName: `${row.firstName} ${row.lastName}`,
  }));
}



// Get current fines for patron view
async function SyncCurrentFines() {
  const [rows] = await pool.query(
    `
    SELECT
      l.loan_id AS loanId,
      l.patron_id AS patronId,
      ROUND(DATEDIFF(CURDATE(), l.loan_due_date) * pr.fine, 2) AS currentFine
    FROM loans l
    JOIN patron_roles pr ON pr.patron_role_code = l.patron_role_code
    WHERE l.loan_status_code = 1
      AND l.loan_due_date < CURDATE()
      AND pr.fine > 0
    `
  );

  for (const row of rows) {
    const [existingFines] = await pool.query(
      `
      SELECT fine_id AS fineId, waived_date AS waivedDate
      FROM fines
      WHERE loan_id = ?
      `,
      [row.loanId]
    );

    if (existingFines.length === 0) {
      await pool.query(
        `
        INSERT INTO fines
          (patron_id, loan_id, fine_amount, paid_amount, fine_date)
        VALUES
          (?, ?, ?, 0, CURDATE())
        `,
        [row.patronId, row.loanId, row.currentFine]
      );
      continue;
    }

    const fine = existingFines[0];

    if (fine.waivedDate) {
      continue;
    }

    await pool.query(
      `
      UPDATE fines
      SET fine_amount = ?
      WHERE fine_id = ?
      `,
      [row.currentFine, fine.fineId]
    );
  }
}

// Get current fines for staff view
app.get(["/staff/fines/current", "/api/staff/fines/current"], async (req, res) => {
  try {
    const user = await RequireStaffUser(req, res);

    if (!user) {
      return;
    }

    await SyncCurrentFines();

    const [rows] = await pool.query(
      `
      SELECT
        f.fine_id AS fineId,
        f.loan_id AS loanId,
        f.patron_id AS patronId,
        f.fine_amount AS fineAmount,
        f.paid_amount AS paidAmount,
        ROUND(f.fine_amount - f.paid_amount, 2) AS remainingAmount,
        f.fine_date AS fineDate,
        f.paid_date AS paidDate,
        f.waived_date AS waivedDate,
        l.item_id AS itemId,
        l.loan_due_date AS loanDueDate,
        p.first_name AS firstName,
        p.last_name AS lastName,
        pr.fine AS dailyFine,
        DATEDIFF(CURDATE(), l.loan_due_date) AS daysOverdue
      FROM fines f
      JOIN loans l ON l.loan_id = f.loan_id
      JOIN patrons p ON p.patron_id = f.patron_id
      JOIN patron_roles pr ON pr.patron_role_code = l.patron_role_code
      WHERE l.loan_status_code = 1
      AND l.loan_due_date < CURDATE()
      AND pr.fine > 0
      AND f.waived_date IS NULL
      ORDER BY remainingAmount DESC;
      `
    );

    const formattedRows = rows.map((row) => ({
      ...row,
      patronName: `${row.firstName} ${row.lastName}`,
    }));

    return res.json(formattedRows);
  } catch (error) {
    console.error("Load current staff fines error:", error);
    return res.status(500).json({
      error: FormatServerError(error, "Failed to load current fines."),
    });
  }
});

// Pay fine endpoint
app.post(["/fines/:fineId/pay", "/api/fines/:fineId/pay"], async (req, res) => {
  try {
    const user = await RequireStaffUser(req, res);

    if (!user) {
      return;
    }

    await SyncCurrentFines();

    const fineId = ParsePositiveInteger(req.params.fineId);
    const amount = Number(req.body?.amount);

    if (!fineId) {
      return res.status(400).json({ error: "A valid fineId is required." });
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ error: "A valid payment amount is required." });
    }

    const [fines] = await pool.query(
      `
      SELECT
        fine_id AS fineId,
        fine_amount AS fineAmount,
        paid_amount AS paidAmount,
        waived_date AS waivedDate
      FROM fines
      WHERE fine_id = ?
      `,
      [fineId]
    );

    if (fines.length === 0) {
      return res.status(404).json({ error: "Fine not found." });
    }

    const fine = fines[0];

    if (fine.waivedDate) {
      return res.status(400).json({ error: "This fine has already been waived." });
    }

    const remainingAmount = Number((fine.fineAmount - fine.paidAmount).toFixed(2));

    if (amount > remainingAmount) {
      return res.status(400).json({ error: "Payment amount cannot exceed the current fine." });
    }

    const newPaidAmount = Number((fine.paidAmount + amount).toFixed(2));
    const isFullyPaid = newPaidAmount >= fine.fineAmount;

    await pool.query(
      `
      UPDATE fines
      SET paid_amount = ?,
          paid_date = CASE WHEN ? THEN CURDATE() ELSE paid_date END
      WHERE fine_id = ?
      `,
      [newPaidAmount, isFullyPaid, fineId]
    );

    return res.json({
      message: "Fine payment recorded successfully.",
      paidAmount: newPaidAmount,
    });
  } catch (error) {
    console.error("Pay fine error:", error);
    return res.status(500).json({
      error: FormatServerError(error, "Failed to pay fine."),
    });
  }
});

// Waive fine endpoint
app.post(["/fines/:fineId/waive", "/api/fines/:fineId/waive"], async (req, res) => {
  try {
    const user = await RequireStaffUser(req, res);

    if (!user) {
      return;
    }

    const fineId = ParsePositiveInteger(req.params.fineId);

    if (!fineId) {
      return res.status(400).json({ error: "A valid fineId is required." });
    }

    const [fines] = await pool.query(
      `
      SELECT fine_id AS fineId, waived_date AS waivedDate
      FROM fines
      WHERE fine_id = ?
      `,
      [fineId]
    );

    if (fines.length === 0) {
      return res.status(404).json({ error: "Fine not found." });
    }

    const fine = fines[0];

    if (fine.waivedDate) {
      return res.status(400).json({ error: "This fine has already been waived." });
    }

    await pool.query(
      `
      UPDATE fines
      SET waived_date = CURDATE()
      WHERE fine_id = ?
      `,
      [fineId]
    );

    return res.json({ message: "Fine waived successfully." });
  } catch (error) {
    console.error("Waive fine error:", error);
    return res.status(500).json({
      error: FormatServerError(error, "Failed to waive fine."),
    });
  }
});

// Get most borrowed books report
app.get(["/reports/most-borrowed-books", "/api/reports/most-borrowed-books"], async (req, res) => {
  try {
    const user = await RequireStaffUser(req, res);

    if (!user) {
      return;
    }

    const [rows] = await pool.query(
      `
      SELECT
        b.item_id AS itemId,
        b.title,
        GROUP_CONCAT(CONCAT(a.first_name, ' ', a.last_name) SEPARATOR ', ') AS authors,
        COUNT(l.loan_id) AS totalLoans
      FROM books b
      LEFT JOIN authors a
        ON a.item_id = b.item_id
      LEFT JOIN loans l
        ON l.item_id = b.item_id
      GROUP BY b.item_id, b.title
      ORDER BY totalLoans DESC, b.title ASC
      `
    );

    return res.json(rows);
  } catch (error) {
    console.error("Load most borrowed books report error:", error);
    return res.status(500).json({
      error: FormatServerError(error, "Failed to load most borrowed books report."),
    });
  }
});

// Get patron summary report
app.get(["/reports/patron-summary", "/api/reports/patron-summary"], async (req, res) => {
  try {
    const user = await RequireStaffUser(req, res);

    if (!user) {
      return;
    }

    const patronId = ParsePositiveInteger(req.query.patronId);

    if (!patronId) {
      return res.status(400).json({ error: "A valid patronId is required." });
    }

    const [patrons] = await pool.query(
      `
      SELECT
        p.patron_id AS patronId,
        p.first_name AS firstName,
        p.last_name AS lastName,
        p.email,
        p.date_of_birth AS dateOfBirth,
        p.is_active AS isActive,
        pr.patron_role AS patronRole
      FROM patrons p
      JOIN patron_roles pr
        ON pr.patron_role_code = p.patron_role_code
      WHERE p.patron_id = ?
      `,
      [patronId]
    );

    if (patrons.length === 0) {
      return res.status(404).json({ error: "Patron not found." });
    }

    const patron = patrons[0];

    const [holds] = await pool.query(
      `
      SELECT
        h.hold_id AS holdId,
        h.item_id AS itemId,
        h.hold_origin_date AS holdStart,
        h.hold_expiration_date AS holdEnd,
        COALESCE(
          b.title,
          per.title,
          am.title,
          e.equipment_name
        ) AS title,
        COALESCE(
          (
            SELECT GROUP_CONCAT(CONCAT(a.first_name, ' ', a.last_name) SEPARATOR ', ')
            FROM authors a
            WHERE a.item_id = b.item_id
          ),
          (
            SELECT GROUP_CONCAT(CONCAT(c.first_name, ' ', c.last_name) SEPARATOR ', ')
            FROM contributors c
            WHERE c.item_id = am.item_id
          ),
          NULL
        ) AS creator
      FROM holds h
      LEFT JOIN books b ON b.item_id = h.item_id
      LEFT JOIN periodicals per ON per.item_id = h.item_id
      LEFT JOIN audiovisual_media am ON am.item_id = h.item_id
      LEFT JOIN equipment e ON e.item_id = h.item_id
      WHERE h.patron_id = ?
      ORDER BY h.hold_expiration_date ASC, h.hold_id ASC
      `,
      [patronId]
    );

    const [loans] = await pool.query(
      `
      SELECT
        l.loan_id AS loanId,
        l.item_id AS itemId,
        l.loan_origin_date AS loanStart,
        l.loan_due_date AS loanEnd,
        l.loan_status_code AS loanStatusCode,
        COALESCE(
          b.title,
          per.title,
          am.title,
          e.equipment_name
        ) AS title,
        COALESCE(
          (
            SELECT GROUP_CONCAT(CONCAT(a.first_name, ' ', a.last_name) SEPARATOR ', ')
            FROM authors a
            WHERE a.item_id = b.item_id
          ),
          (
            SELECT GROUP_CONCAT(CONCAT(c.first_name, ' ', c.last_name) SEPARATOR ', ')
            FROM contributors c
            WHERE c.item_id = am.item_id
          ),
          NULL
        ) AS creator
      FROM loans l
      LEFT JOIN books b ON b.item_id = l.item_id
      LEFT JOIN periodicals per ON per.item_id = l.item_id
      LEFT JOIN audiovisual_media am ON am.item_id = l.item_id
      LEFT JOIN equipment e ON e.item_id = l.item_id
      WHERE l.patron_id = ?
      ORDER BY l.loan_due_date ASC, l.loan_id ASC
      `,
      [patronId]
    );

    const [fines] = await pool.query(
      `
      SELECT
        f.fine_id AS fineId,
        f.loan_id AS loanId,
        f.fine_amount AS fineAmount,
        f.paid_amount AS paidAmount,
        ROUND(f.fine_amount - f.paid_amount, 2) AS remainingAmount,
        f.fine_date AS fineDate,
        f.paid_date AS paidDate,
        f.waived_date AS waivedDate,
        COALESCE(
          b.title,
          per.title,
          am.title,
          e.equipment_name
        ) AS title
      FROM fines f
      LEFT JOIN loans l ON l.loan_id = f.loan_id
      LEFT JOIN books b ON b.item_id = l.item_id
      LEFT JOIN periodicals per ON per.item_id = l.item_id
      LEFT JOIN audiovisual_media am ON am.item_id = l.item_id
      LEFT JOIN equipment e ON e.item_id = l.item_id
      WHERE f.patron_id = ?
      ORDER BY f.fine_date DESC, f.fine_id DESC
      `,
      [patronId]
    );

    return res.json({
      patron,
      holds,
      loans,
      fines,
    });
  } catch (error) {
    console.error("Load patron summary report error:", error);
    return res.status(500).json({
      error: FormatServerError(error, "Failed to load patron summary report."),
    });
  }
});