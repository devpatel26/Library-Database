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
const passwordResetMaxAgeSeconds = Math.max(
  Number(process.env.PASSWORD_RESET_MAX_AGE_SECONDS) || 60 * 30,
  60 * 5
);

const sessionSecret =
  process.env.SESSION_SECRET || 'team8';
// const sessionSecret =
//     process.env.SESSION_SECRET?.trim() ||
//     (process.env.NODE_ENV === "production"
//         ? "team8"
//         : "library-dev-session-secret-change-me");
// const passwordResetSecret =
//     process.env.PASSWORD_RESET_SECRET?.trim() || sessionSecret;
// const defaultAppOrigin =
//     process.env.APP_ORIGIN?.trim() ||
//     process.env.FRONTEND_ORIGIN?.trim() ||
//     "http://localhost:5173";

// if (!sessionSecret) {
//     throw new Error("SESSION_SECRET must be set when NODE_ENV=production.");
// }

// if (!process.env.SESSION_SECRET && process.env.NODE_ENV !== "production") {
//     console.warn(
//         'SESSION_SECRET is not set in "backend/.env". Using a development fallback secret.'
//     );
// }

console.log("DB_HOST =", process.env.DB_HOST);
console.log("DB_PORT =", process.env.DB_PORT);
console.log("DB_USER =", process.env.DB_USER);
console.log("DB_NAME =", process.env.DB_NAME);

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
  waitForConnections: true,
  connectionLimit: 10
}).promise();


/*const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: "Team8@librarydatabaseteam8",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    ssl: {
      rejectUnauthorized: false
    },
    connectTimeout: 10000
})
.promise();  */

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

function BuildPasswordResetFingerprint(passwordHash) {
  return crypto
    .createHash("sha256")
    .update(String(passwordHash ?? ""))
    .digest("base64url");
}

function BuildPasswordResetToken({ userType, patronId, staffId, passwordHash }) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const subjectId = userType === "patron" ? patronId : staffId;
  const payload = {
    subjectType: userType,
    subjectId,
    passwordDigest: BuildPasswordResetFingerprint(passwordHash),
    nonce: crypto.randomBytes(8).toString("hex"),
    issuedAt,
    expiresAt: issuedAt + passwordResetMaxAgeSeconds,
  };
  const encodedPayload = EncodeBase64Url(JSON.stringify(payload));
  const signature = crypto
    .createHmac("sha256", passwordResetSecret)
    .update(encodedPayload)
    .digest("base64url");

  return {
    token: `${encodedPayload}.${signature}`,
    expiresAt: new Date(payload.expiresAt * 1000).toISOString(),
  };
}

function ParsePasswordResetToken(token) {
  if (!token) {
    return null;
  }

  const [encodedPayload, encodedSignature] = token.split(".");

  if (!encodedPayload || !encodedSignature) {
    return null;
  }

  const expectedSignature = crypto
    .createHmac("sha256", passwordResetSecret)
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
  const passwordDigest =
    typeof payload?.passwordDigest === "string" &&
      payload.passwordDigest.trim() !== ""
      ? payload.passwordDigest.trim()
      : "";

  if (!subjectType || !subjectId || !Number.isFinite(expiresAt) || !passwordDigest) {
    return null;
  }

  if (expiresAt <= Math.floor(Date.now() / 1000)) {
    return null;
  }

  return {
    userType: subjectType,
    subjectId,
    passwordDigest,
  };
}

function GetApplicationOrigin(req) {
  const origin = String(req.get("origin") ?? "").trim();

  if (/^https?:\/\//i.test(origin)) {
    return origin.replace(/\/+$/, "");
  }

  const referer = String(req.get("referer") ?? "").trim();

  if (/^https?:\/\//i.test(referer)) {
    try {
      return new URL(referer).origin;
    } catch {
      // Fall through to the configured default origin.
    }
  }

  return defaultAppOrigin.replace(/\/+$/, "");
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

async function FindPasswordResetAccountByEmail(email) {
  const normalizedEmail = String(email ?? "").trim();

  if (!normalizedEmail) {
    return null;
  }

  const [patronRows] = await pool.query(
    `
        SELECT
            patron_id AS patronId,
            email,
            password_hash AS passwordHash,
            is_active AS isActive
        FROM patrons
        WHERE LOWER(email) = LOWER(?)
        LIMIT 1
        `,
    [normalizedEmail]
  );

  if (patronRows.length > 0) {
    return {
      userType: "patron",
      patronId: patronRows[0].patronId,
      email: patronRows[0].email,
      passwordHash: patronRows[0].passwordHash,
      isActive: Boolean(patronRows[0].isActive),
    };
  }

  const [staffRows] = await pool.query(
    `
        SELECT
            staff_id AS staffId,
            email,
            password_hash AS passwordHash,
            is_active AS isActive
        FROM staff
        WHERE LOWER(email) = LOWER(?)
        LIMIT 1
        `,
    [normalizedEmail]
  );

  if (staffRows.length === 0) {
    return null;
  }

  return {
    userType: "staff",
    staffId: staffRows[0].staffId,
    email: staffRows[0].email,
    passwordHash: staffRows[0].passwordHash,
    isActive: Boolean(staffRows[0].isActive),
  };
}

async function FindPasswordResetAccountBySubject({ userType, subjectId }) {
  if (userType === "patron") {
    const [rows] = await pool.query(
      `
            SELECT
                patron_id AS patronId,
                email,
                password_hash AS passwordHash,
                is_active AS isActive
            FROM patrons
            WHERE patron_id = ?
            `,
      [subjectId]
    );

    if (rows.length === 0) {
      return null;
    }

    return {
      userType: "patron",
      patronId: rows[0].patronId,
      email: rows[0].email,
      passwordHash: rows[0].passwordHash,
      isActive: Boolean(rows[0].isActive),
    };
  }

  const [rows] = await pool.query(
    `
        SELECT
            staff_id AS staffId,
            email,
            password_hash AS passwordHash,
            is_active AS isActive
        FROM staff
        WHERE staff_id = ?
        `,
    [subjectId]
  );

  if (rows.length === 0) {
    return null;
  }

  return {
    userType: "staff",
    staffId: rows[0].staffId,
    email: rows[0].email,
    passwordHash: rows[0].passwordHash,
    isActive: Boolean(rows[0].isActive),
  };
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

function NormalizeManagedUserType(value) {
  const normalizedValue = SafeText(value).trim().toLowerCase();

  if (normalizedValue === "patron" || normalizedValue === "staff") {
    return normalizedValue;
  }

  return "all";
}

function NormalizeManagedItemCategory(value) {
  const normalizedValue = SafeText(value).trim().toLowerCase();

  if (normalizedValue === "audiovisual_media") {
    return "audiovisualmedia";
  }

  if (
    normalizedValue === "book" ||
    normalizedValue === "periodical" ||
    normalizedValue === "audiovisualmedia" ||
    normalizedValue === "equipment"
  ) {
    return normalizedValue;
  }

  return "all";
}

function ParseBooleanFlag(value) {
  if (value === true || value === false) {
    return value ? 1 : 0;
  }

  const normalizedValue = SafeText(value).trim().toLowerCase();

  if (["1", "true", "yes", "on"].includes(normalizedValue)) {
    return 1;
  }

  if (["0", "false", "no", "off"].includes(normalizedValue)) {
    return 0;
  }

  return null;
}

function NormalizeRequiredText(value, maxLength) {
  const normalizedValue = SafeText(value).trim();

  if (!normalizedValue || normalizedValue.length > maxLength) {
    return null;
  }

  return normalizedValue;
}

function NormalizeOptionalText(value, maxLength) {
  const normalizedValue = SafeText(value).trim();

  if (!normalizedValue) {
    return null;
  }

  if (normalizedValue.length > maxLength) {
    return null;
  }

  return normalizedValue;
}

function NormalizeDateInput(value, { allowEmpty = false } = {}) {
  const normalizedValue = SafeText(value).trim();

  if (!normalizedValue) {
    return allowEmpty ? "" : null;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedValue)) {
    return null;
  }

  return normalizedValue;
}

async function GetManagedItemBaseRow(itemId) {
  const [rows] = await pool.query(
    `
        SELECT
            i.item_id AS itemId,
            i.available,
            i.on_hold AS onHold,
            i.unavailable,
            i.available + i.on_hold + i.unavailable AS totalCopies,
            CASE
                WHEN b.item_id IS NOT NULL THEN 'book'
                WHEN per.item_id IS NOT NULL THEN 'periodical'
                WHEN am.item_id IS NOT NULL THEN 'audiovisualmedia'
                WHEN e.item_id IS NOT NULL THEN 'equipment'
                ELSE NULL
            END AS category
        FROM items i
        LEFT JOIN books b ON b.item_id = i.item_id
        LEFT JOIN periodicals per ON per.item_id = i.item_id
        LEFT JOIN audiovisual_media am ON am.item_id = i.item_id
        LEFT JOIN equipment e ON e.item_id = i.item_id
        WHERE i.item_id = ?
        `,
    [itemId]
  );

  return rows[0] ?? null;
}

async function GetManagedItemDetail(itemId) {
  const baseRow = await GetManagedItemBaseRow(itemId);

  if (!baseRow || !baseRow.category) {
    return null;
  }

  if (baseRow.category === "book") {
    const [rows] = await pool.query(
      `
            SELECT
                b.title,
                b.shelf_number AS shelfNumber,
                b.genre_code AS genreCode,
                b.language_code AS languageCode,
                b.book_type_code AS formatCode,
                b.publisher,
                b.publication_date AS publicationDate,
                b.summary,
                a.first_name AS authorFirstName,
                a.last_name AS authorLastName
            FROM books b
            LEFT JOIN authors a
                ON a.author_id = (
                    SELECT MIN(a2.author_id)
                    FROM authors a2
                    WHERE a2.item_id = b.item_id
                )
            WHERE b.item_id = ?
            `,
      [itemId]
    );

    return rows.length === 0 ? null : { ...baseRow, ...rows[0] };
  }

  if (baseRow.category === "periodical") {
    const [rows] = await pool.query(
      `
            SELECT
                p.title,
                p.shelf_number AS shelfNumber,
                p.genre_code AS genreCode,
                p.language_code AS languageCode,
                p.periodical_type_code AS formatCode,
                p.publisher,
                p.publication_date AS publicationDate,
                p.summary
            FROM periodicals p
            WHERE p.item_id = ?
            `,
      [itemId]
    );

    return rows.length === 0 ? null : { ...baseRow, ...rows[0] };
  }

  if (baseRow.category === "audiovisualmedia") {
    const [rows] = await pool.query(
      `
            SELECT
                am.title,
                am.shelf_number AS shelfNumber,
                am.genre_code AS genreCode,
                am.language_code AS languageCode,
                am.audiovisual_media_type_code AS formatCode,
                am.publisher,
                am.publication_date AS publicationDate,
                am.summary,
                am.runtime,
                c.first_name AS contributorFirstName,
                c.last_name AS contributorLastName,
                c.role AS contributorRole
            FROM audiovisual_media am
            LEFT JOIN contributors c
                ON c.contributor_id = (
                    SELECT MIN(c2.contributor_id)
                    FROM contributors c2
                    WHERE c2.item_id = am.item_id
                )
            WHERE am.item_id = ?
            `,
      [itemId]
    );

    return rows.length === 0 ? null : { ...baseRow, ...rows[0] };
  }

  const [rows] = await pool.query(
    `
        SELECT equipment_name AS title
        FROM equipment
        WHERE item_id = ?
        `,
    [itemId]
  );

  return rows.length === 0 ? null : { ...baseRow, ...rows[0] };
}

function GetPatronItemSelectColumns() {
  return `
        CASE
            WHEN b.item_id IS NOT NULL THEN 'book'
            WHEN per.item_id IS NOT NULL THEN 'periodical'
            WHEN am.item_id IS NOT NULL THEN 'audiovisualmedia'
            ELSE 'equipment'
        END AS category,
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
        ) AS creator,
        COALESCE(
            bt.book_type,
            pt.periodical_type,
            amt.audiovisual_media_type,
            NULL
        ) AS type,
        COALESCE(
            bookLanguage.language,
            periodicalLanguage.language,
            mediaLanguage.language,
            NULL
        ) AS language,
        COALESCE(
            bookGenre.genre,
            periodicalGenre.genre,
            mediaGenre.genre,
            NULL
        ) AS genre,
        COALESCE(
            b.summary,
            per.summary,
            am.summary,
            NULL
        ) AS summary,
        COALESCE(
            b.publisher,
            per.publisher,
            am.publisher,
            NULL
        ) AS publisher,
        COALESCE(
            b.shelf_number,
            per.shelf_number,
            am.shelf_number,
            NULL
        ) AS shelfNumber,
        COALESCE(
            b.publication_date,
            per.publication_date,
            am.publication_date,
            NULL
        ) AS publicationDate,
        am.runtime AS runtime
    `;
}

function GetPatronItemJoinClauses(itemIdColumn) {
  return `
        LEFT JOIN books b ON b.item_id = ${itemIdColumn}
        LEFT JOIN book_types bt ON bt.book_type_code = b.book_type_code
        LEFT JOIN languages bookLanguage ON bookLanguage.language_code = b.language_code
        LEFT JOIN genres bookGenre ON bookGenre.genre_code = b.genre_code
        LEFT JOIN periodicals per ON per.item_id = ${itemIdColumn}
        LEFT JOIN periodical_types pt ON pt.periodical_type_code = per.periodical_type_code
        LEFT JOIN languages periodicalLanguage ON periodicalLanguage.language_code = per.language_code
        LEFT JOIN genres periodicalGenre ON periodicalGenre.genre_code = per.genre_code
        LEFT JOIN audiovisual_media am ON am.item_id = ${itemIdColumn}
        LEFT JOIN audiovisual_media_types amt
            ON amt.audiovisual_media_type_code = am.audiovisual_media_type_code
        LEFT JOIN languages mediaLanguage ON mediaLanguage.language_code = am.language_code
        LEFT JOIN genres mediaGenre ON mediaGenre.genre_code = am.genre_code
        LEFT JOIN equipment e ON e.item_id = ${itemIdColumn}
    `;
}

function BuildPatronLoanQuery({ statusClause, orderBy }) {
  return `
        SELECT
            l.loan_id AS loanId,
            l.item_id AS itemId,
            ${GetPatronItemSelectColumns()},
            l.loan_origin_date AS loanStart,
            l.loan_due_date AS loanEnd,
            l.loan_status_code AS loanStatusCode,
            CASE
                WHEN ls.loan_status_name IS NULL THEN NULL
                ELSE CONCAT(
                    UPPER(LEFT(ls.loan_status_name, 1)),
                    SUBSTRING(ls.loan_status_name, 2)
                )
            END AS loanStatus,
            l.loan_status_code = 1 AND l.loan_due_date < CURDATE() AS overdue
        FROM loans l
        LEFT JOIN loan_statuses ls ON ls.loan_status_code = l.loan_status_code
        ${GetPatronItemJoinClauses("l.item_id")}
        WHERE l.patron_id = ?
          AND ${statusClause}
        ORDER BY ${orderBy}
    `;
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

app.put(["/account/contact", "/api/account/contact"], async (req, res) => {
  try {
    const user = await RequireAuthenticatedUser(req, res);

    if (!user) {
      return;
    }

    const email = String(req.body?.email ?? "").trim();

    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Enter a valid email address." });
    }

    const [matches] = await pool.query(
      `
            SELECT user_type AS userType, account_id AS accountId
            FROM (
                SELECT 'patron' AS user_type, patron_id AS account_id, email
                FROM patrons

                UNION ALL

                SELECT 'staff' AS user_type, staff_id AS account_id, email
                FROM staff
            ) AS accounts
            WHERE LOWER(email) = LOWER(?)
            LIMIT 1
            `,
      [email]
    );

    const accountId = user.userType === "patron" ? user.patronId : user.staffId;

    if (
      matches.length > 0 &&
      (
        matches[0].userType !== user.userType ||
        Number(matches[0].accountId) !== Number(accountId)
      )
    ) {
      return res.status(409).json({ error: "That email address is already in use." });
    }

    const tableName = user.userType === "patron" ? "patrons" : "staff";
    const idColumn = user.userType === "patron" ? "patron_id" : "staff_id";

    await pool.query(
      `
            UPDATE ${tableName}
            SET email = ?
            WHERE ${idColumn} = ?
            `,
      [email, accountId]
    );

    return res.json({
      message: "Contact information updated successfully.",
      email,
    });
  } catch (error) {
    SendServerError(res, error, "Internal Server Error");
  }
});

app.put(["/account/password", "/api/account/password"], async (req, res) => {
  try {
    const user = await RequireAuthenticatedUser(req, res);

    if (!user) {
      return;
    }

    const currentPassword = String(req.body?.currentPassword ?? "");
    const newPassword = String(req.body?.newPassword ?? "");
    const confirmPassword = String(req.body?.confirmPassword ?? "");

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        error: "Current password, new password, and confirmation are required.",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match." });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        error: "New password must be at least 8 characters long.",
      });
    }

    const account = await FindPasswordResetAccountBySubject({
      userType: user.userType,
      subjectId: user.userType === "patron" ? user.patronId : user.staffId,
    });

    if (!account || !account.isActive) {
      return res.status(404).json({ error: "Account not found." });
    }

    const passwordMatchesCurrent = await VerifyPassword(
      currentPassword,
      account.passwordHash,
    );

    if (!passwordMatchesCurrent) {
      return res.status(400).json({ error: "Current password is incorrect." });
    }

    const newPasswordMatchesCurrent = await VerifyPassword(
      newPassword,
      account.passwordHash,
    );

    if (newPasswordMatchesCurrent) {
      return res.status(400).json({
        error: "Choose a password that is different from your current password.",
      });
    }

    const nextPasswordHash = HashPassword(newPassword);
    const tableName = user.userType === "patron" ? "patrons" : "staff";
    const idColumn = user.userType === "patron" ? "patron_id" : "staff_id";
    const idValue = user.userType === "patron" ? user.patronId : user.staffId;

    await pool.query(
      `
            UPDATE ${tableName}
            SET password_hash = ?
            WHERE ${idColumn} = ?
            `,
      [nextPasswordHash, idValue]
    );

    return res.json({ message: "Password updated successfully." });
  } catch (error) {
    SendServerError(res, error, "Internal Server Error");
  }
});

// Fines endpoint
app.get(["/fines", "/api/fines"], async (req, res) => {
  try {
    const user = await RequirePatronUser(req, res);

    if (!user) {
      return;
    }

    await SyncCurrentFines();

    const [rows] = await pool.query(
      `
            SELECT
                f.fine_id AS fineId,
                f.loan_id AS loanId,
                l.item_id AS itemId,
                ${GetPatronItemSelectColumns()},
                COALESCE(f.fine_amount, 0) AS fineAmount,
                COALESCE(f.paid_amount, 0) AS paidAmount,
                ROUND(COALESCE(f.fine_amount, 0) - COALESCE(f.paid_amount, 0), 2) AS remainingAmount,
                f.fine_date AS fineDate,
                f.paid_date AS paidDate,
                f.waived_date AS waivedDate,
                l.loan_due_date AS loanDueDate,
                pr.fine AS dailyFine,
                CASE
                    WHEN l.loan_status_code = 1 THEN GREATEST(DATEDIFF(CURDATE(), l.loan_due_date), 0)
                    ELSE NULL
                END AS daysOverdue,
                CASE
                    WHEN f.waived_date IS NOT NULL THEN 'Waived'
                    WHEN ROUND(COALESCE(f.fine_amount, 0) - COALESCE(f.paid_amount, 0), 2) <= 0 THEN 'Paid'
                    WHEN l.loan_status_code = 1 AND l.loan_due_date < CURDATE() THEN 'Overdue'
                    WHEN l.loan_id IS NULL THEN 'Unpaid'
                    WHEN l.loan_status_code <> 1
                        AND ROUND(COALESCE(f.fine_amount, 0) - COALESCE(f.paid_amount, 0), 2) > 0
                        THEN 'Returned but unpaid'
                    ELSE 'Unpaid'
                END AS fineStatus
            FROM fines f
            LEFT JOIN loans l ON l.loan_id = f.loan_id
            LEFT JOIN patron_roles pr ON pr.patron_role_code = l.patron_role_code
            ${GetPatronItemJoinClauses("l.item_id")}
            WHERE f.patron_id = ?
            ORDER BY
                CASE
                    WHEN f.waived_date IS NOT NULL THEN 4
                    WHEN ROUND(COALESCE(f.fine_amount, 0) - COALESCE(f.paid_amount, 0), 2) <= 0 THEN 3
                    WHEN l.loan_status_code = 1 AND l.loan_due_date < CURDATE() THEN 1
                    WHEN l.loan_id IS NULL THEN 2
                    WHEN l.loan_status_code <> 1
                        AND ROUND(COALESCE(f.fine_amount, 0) - COALESCE(f.paid_amount, 0), 2) > 0
                        THEN 2
                    ELSE 5
                END ASC,
                remainingAmount DESC,
                f.fine_date DESC,
                f.fine_id DESC
            `,
      [user.patronId]
    );

    return res.json(rows);
  } catch (error) {
    SendServerError(res, error, "Internal Server Error");
  }
});

// Loans and Holds endpoint
app.get(["/loans", "/api/loans"], async (req, res) => {
  try {
    await ClearExpiredHolds();
    const user = await RequirePatronUser(req, res);

    if (!user) {
      return;
    }

    const [loans] = await pool.query(
      BuildPatronLoanQuery({
        statusClause: "l.loan_status_code = 1",
        orderBy: "l.loan_due_date ASC, l.loan_id ASC",
      }),
      [user.patronId]
    );

    const [history] = await pool.query(
      BuildPatronLoanQuery({
        statusClause: "l.loan_status_code <> 1",
        orderBy: "l.loan_due_date DESC, l.loan_id DESC",
      }),
      [user.patronId]
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

    res.json({ loans, holds, history });
  } catch (error) {
    SendServerError(res, error, "Internal Server Error");
  }
});

app.get(["/account/activity", "/api/account/activity"], async (req, res) => {
  try {
    await ClearExpiredHolds();
    const user = await RequirePatronUser(req, res);

    if (!user) {
      return;
    }

    await SyncCurrentFines();

    const [holdRows] = await pool.query(
      `
            SELECT
                CONCAT('hold-', h.hold_id) AS activityId,
                h.hold_origin_date AS activityDate,
                'hold' AS activityType,
                ${GetPatronItemSelectColumns()},
                h.hold_expiration_date AS holdEnd,
                COALESCE(LOWER(hs.hold_status_name), 'active') AS holdStatus
            FROM holds h
            LEFT JOIN hold_statuses hs ON hs.hold_status_code = h.hold_status_code
            ${GetPatronItemJoinClauses("h.item_id")}
            WHERE h.patron_id = ?
            `,
      [user.patronId]
    );

    const [loanRows] = await pool.query(
      `
            SELECT
                CONCAT('loan-', l.loan_id) AS activityId,
                l.loan_origin_date AS activityDate,
                'loan' AS activityType,
                ${GetPatronItemSelectColumns()},
                l.loan_due_date AS loanEnd,
                CASE
                    WHEN ls.loan_status_name IS NULL THEN 'active'
                    ELSE LOWER(ls.loan_status_name)
                END AS loanStatus,
                l.loan_status_code = 1 AND l.loan_due_date < CURDATE() AS overdue
            FROM loans l
            LEFT JOIN loan_statuses ls ON ls.loan_status_code = l.loan_status_code
            ${GetPatronItemJoinClauses("l.item_id")}
            WHERE l.patron_id = ?
            `,
      [user.patronId]
    );

    const [fineRows] = await pool.query(
      `
            SELECT
                f.fine_id AS fineId,
                f.loan_id AS loanId,
                ${GetPatronItemSelectColumns()},
                f.fine_amount AS fineAmount,
                f.paid_amount AS paidAmount,
                ROUND(COALESCE(f.fine_amount, 0) - COALESCE(f.paid_amount, 0), 2) AS remainingAmount,
                f.fine_date AS fineDate,
                f.paid_date AS paidDate,
                f.waived_date AS waivedDate
            FROM fines f
            LEFT JOIN loans l ON l.loan_id = f.loan_id
            ${GetPatronItemJoinClauses("l.item_id")}
            WHERE f.patron_id = ?
            `,
      [user.patronId]
    );

    const activity = [
      ...holdRows.map((row) => ({
        activityId: row.activityId,
        activityType: row.activityType,
        activityDate: row.activityDate,
        headline: "Placed hold",
        title: row.title,
        creator: row.creator,
        detail:
          row.holdStatus === "ready"
            ? `Ready for pickup until ${row.holdEnd}`
            : `Hold expires ${row.holdEnd}`,
        status: row.holdStatus === "ready" ? "Ready" : "Active",
      })),
      ...loanRows.map((row) => ({
        activityId: row.activityId,
        activityType: row.activityType,
        activityDate: row.activityDate,
        headline: "Checked out item",
        title: row.title,
        creator: row.creator,
        detail: `Due ${row.loanEnd}`,
        status: row.overdue
          ? "Overdue"
          : row.loanStatus === "returned"
            ? "Returned"
            : "Active",
      })),
      ...fineRows.flatMap((row) => {
        const events = [];

        if (row.fineDate) {
          events.push({
            activityId: `fine-${row.fineId}-assessed`,
            activityType: "fine",
            activityDate: row.fineDate,
            headline: "Fine assessed",
            title: row.title,
            creator: row.creator,
            detail: `Balance $${Number(row.fineAmount ?? 0).toFixed(2)}`,
            status: "Open",
          });
        }

        if (row.paidDate) {
          events.push({
            activityId: `fine-${row.fineId}-paid`,
            activityType: "fine",
            activityDate: row.paidDate,
            headline: "Fine payment recorded",
            title: row.title,
            creator: row.creator,
            detail: `Paid $${Number(row.paidAmount ?? 0).toFixed(2)}`,
            status: "Paid",
          });
        }

        if (row.waivedDate) {
          events.push({
            activityId: `fine-${row.fineId}-waived`,
            activityType: "fine",
            activityDate: row.waivedDate,
            headline: "Fine waived",
            title: row.title,
            creator: row.creator,
            detail: `Waived remaining $${Number(row.remainingAmount ?? 0).toFixed(2)}`,
            status: "Waived",
          });
        }

        return events;
      }),
    ]
      .filter((row) => row.activityDate)
      .sort((left, right) => {
        const leftDate = Date.parse(left.activityDate);
        const rightDate = Date.parse(right.activityDate);

        if (Number.isFinite(rightDate) && Number.isFinite(leftDate) && rightDate !== leftDate) {
          return rightDate - leftDate;
        }

        return String(right.activityId).localeCompare(String(left.activityId));
      });

    return res.json(activity);
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

app.get(["/admin/users", "/api/admin/users"], async (req, res) => {
  try {
    const user = await RequireStaffUser(req, res, { adminOnly: true });

    if (!user) {
      return;
    }

    const userType = NormalizeManagedUserType(req.query.userType);
    const searchText = SafeText(req.query.q).trim();
    const like = `%${searchText}%`;

    const patronWhereClause = searchText
      ? `
        WHERE
          CAST(p.patron_id AS CHAR) LIKE ?
          OR CONCAT_WS(' ', p.first_name, p.last_name) LIKE ?
          OR p.email LIKE ?
      `
      : "";
    const staffWhereClause = searchText
      ? `
        WHERE
          CAST(s.staff_id AS CHAR) LIKE ?
          OR CONCAT_WS(' ', s.first_name, s.last_name) LIKE ?
          OR s.email LIKE ?
          OR s.address LIKE ?
          OR COALESCE(s.phone_number, '') LIKE ?
      `
      : "";

    const queries = {
      patron: {
        sql: `
          SELECT
            'patron' AS userType,
            p.patron_id AS userId,
            p.first_name AS firstName,
            p.last_name AS lastName,
            p.email,
            p.date_of_birth AS dateOfBirth,
            p.patron_role_code AS roleCode,
            pr.patron_role AS roleName,
            p.is_active AS isActive,
            NULL AS phoneNumber,
            NULL AS address
          FROM patrons p
          LEFT JOIN patron_roles pr ON pr.patron_role_code = p.patron_role_code
          ${patronWhereClause}
        `,
        params: searchText ? [like, like, like] : [],
      },
      staff: {
        sql: `
          SELECT
            'staff' AS userType,
            s.staff_id AS userId,
            s.first_name AS firstName,
            s.last_name AS lastName,
            s.email,
            s.date_of_birth AS dateOfBirth,
            s.staff_role_code AS roleCode,
            sr.staff_role AS roleName,
            s.is_active AS isActive,
            s.phone_number AS phoneNumber,
            s.address
          FROM staff s
          LEFT JOIN staff_roles sr ON sr.staff_role_code = s.staff_role_code
          ${staffWhereClause}
        `,
        params: searchText ? [like, like, like, like, like] : [],
      },
    };

    const selectedQueries = userType === "all"
      ? [queries.patron, queries.staff]
      : [queries[userType]];

    const [rows] = await pool.query(
      `
      SELECT *
      FROM (
        ${selectedQueries.map((query) => query.sql).join(" UNION ALL ")}
      ) AS managedUsers
      ORDER BY lastName ASC, firstName ASC, userType ASC, userId ASC
      `,
      selectedQueries.flatMap((query) => query.params)
    );

    return res.json(rows);
  } catch (error) {
    console.error("Admin users list error:", error);
    return res.status(500).json({
      error: FormatServerError(error, "Failed to load users."),
    });
  }
});

app.put(["/admin/users/:userType/:userId", "/api/admin/users/:userType/:userId"], async (req, res) => {
  try {
    const user = await RequireStaffUser(req, res, { adminOnly: true });

    if (!user) {
      return;
    }

    const userType = NormalizeManagedUserType(req.params.userType);
    const userId = ParsePositiveInteger(req.params.userId);

    if (userType === "all" || !userId) {
      return res.status(400).json({ error: "A valid user type and user ID are required." });
    }

    const firstName = NormalizeRequiredText(req.body?.firstName, 20);
    const lastName = NormalizeRequiredText(req.body?.lastName, 20);
    const email = NormalizeRequiredText(
      req.body?.email,
      userType === "patron" ? 40 : 100
    );
    const dateOfBirth = NormalizeDateInput(req.body?.dateOfBirth, {
      allowEmpty: userType === "patron",
    });
    const roleCode = ParsePositiveInteger(req.body?.roleCode);
    const isActive = ParseBooleanFlag(req.body?.isActive);

    if (!firstName || !lastName || !email || !roleCode || isActive === null) {
      return res.status(400).json({ error: "Missing or invalid required fields." });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Enter a valid email address." });
    }

    if (dateOfBirth === null) {
      return res.status(400).json({ error: "Enter a valid date of birth." });
    }

    const isSelfStaffAccount = userType === "staff" && Number(user.staffId) === Number(userId);

    if (isSelfStaffAccount && !isActive) {
      return res.status(400).json({
        error: "You cannot deactivate the admin account you are currently using.",
      });
    }

    if (isSelfStaffAccount && roleCode !== 2) {
      return res.status(400).json({
        error: "You cannot remove admin access from the account you are currently using.",
      });
    }

    const [accountRows] = await pool.query(
      userType === "patron"
        ? `
          SELECT patron_id AS userId
          FROM patrons
          WHERE patron_id = ?
        `
        : `
          SELECT staff_id AS userId
          FROM staff
          WHERE staff_id = ?
        `,
      [userId]
    );

    if (accountRows.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    const [emailMatches] = await pool.query(
      `
      SELECT user_type AS userType, account_id AS accountId
      FROM (
        SELECT 'patron' AS user_type, patron_id AS account_id, email
        FROM patrons

        UNION ALL

        SELECT 'staff' AS user_type, staff_id AS account_id, email
        FROM staff
      ) AS accounts
      WHERE LOWER(email) = LOWER(?)
      LIMIT 1
      `,
      [email]
    );

    if (
      emailMatches.length > 0 &&
      (
        emailMatches[0].userType !== userType ||
        Number(emailMatches[0].accountId) !== Number(userId)
      )
    ) {
      return res.status(409).json({ error: "That email address is already in use." });
    }

    if (userType === "patron") {
      const [roleRows] = await pool.query(
        `
        SELECT patron_role_code AS roleCode
        FROM patron_roles
        WHERE patron_role_code = ?
        `,
        [roleCode]
      );

      if (roleRows.length === 0) {
        return res.status(400).json({ error: "Select a valid patron role." });
      }

      await pool.query(
        `
        UPDATE patrons
        SET first_name = ?,
            last_name = ?,
            email = ?,
            date_of_birth = ?,
            patron_role_code = ?,
            is_active = ?
        WHERE patron_id = ?
        `,
        [firstName, lastName, email, dateOfBirth || null, roleCode, isActive, userId]
      );
    } else {
      const address = NormalizeRequiredText(req.body?.address, 100);
      const phoneNumber = NormalizeOptionalText(req.body?.phoneNumber, 10);

      if (!address) {
        return res.status(400).json({ error: "Address is required for staff accounts." });
      }

      if (phoneNumber && !/^\d{10}$/.test(phoneNumber)) {
        return res.status(400).json({
          error: "Phone number must contain exactly 10 digits.",
        });
      }

      const [roleRows] = await pool.query(
        `
        SELECT staff_role_code AS roleCode
        FROM staff_roles
        WHERE staff_role_code = ?
        `,
        [roleCode]
      );

      if (roleRows.length === 0) {
        return res.status(400).json({ error: "Select a valid staff role." });
      }

      await pool.query(
        `
        UPDATE staff
        SET first_name = ?,
            last_name = ?,
            email = ?,
            date_of_birth = ?,
            staff_role_code = ?,
            phone_number = ?,
            address = ?,
            is_active = ?
        WHERE staff_id = ?
        `,
        [firstName, lastName, email, dateOfBirth, roleCode, phoneNumber, address, isActive, userId]
      );
    }

    return res.json({ message: "User updated successfully." });
  } catch (error) {
    console.error("Admin user update error:", error);
    return res.status(500).json({
      error: FormatServerError(error, "Failed to update user."),
    });
  }
});

app.delete(["/admin/users/:userType/:userId", "/api/admin/users/:userType/:userId"], async (req, res) => {
  try {
    const user = await RequireStaffUser(req, res, { adminOnly: true });

    if (!user) {
      return;
    }

    const userType = NormalizeManagedUserType(req.params.userType);
    const userId = ParsePositiveInteger(req.params.userId);

    if (userType === "all" || !userId) {
      return res.status(400).json({ error: "A valid user type and user ID are required." });
    }

    if (userType === "staff" && Number(user.staffId) === Number(userId)) {
      return res.status(400).json({
        error: "You cannot delete the admin account you are currently using.",
      });
    }

    if (userType === "patron") {
      const [patrons] = await pool.query(
        `
        SELECT patron_id AS userId
        FROM patrons
        WHERE patron_id = ?
        `,
        [userId]
      );

      if (patrons.length === 0) {
        return res.status(404).json({ error: "Patron not found." });
      }

      const [usageRows] = await pool.query(
        `
        SELECT
          (SELECT COUNT(*) FROM holds WHERE patron_id = ?) AS holdCount,
          (SELECT COUNT(*) FROM loans WHERE patron_id = ?) AS loanCount,
          (SELECT COUNT(*) FROM fines WHERE patron_id = ?) AS fineCount
        `,
        [userId, userId, userId]
      );

      const usage = usageRows[0] ?? {};

      if (Number(usage.holdCount) > 0 || Number(usage.loanCount) > 0 || Number(usage.fineCount) > 0) {
        return res.status(400).json({
          error: "This patron has related holds, loans, or fines and cannot be deleted.",
        });
      }

      await pool.query(
        `
        DELETE FROM patrons
        WHERE patron_id = ?
        `,
        [userId]
      );

      return res.json({ message: "Patron deleted successfully." });
    }

    const [staffRows] = await pool.query(
      `
      SELECT staff_id AS userId
      FROM staff
      WHERE staff_id = ?
      `,
      [userId]
    );

    if (staffRows.length === 0) {
      return res.status(404).json({ error: "Staff account not found." });
    }

    await pool.query(
      `
      DELETE FROM staff
      WHERE staff_id = ?
      `,
      [userId]
    );

    return res.json({ message: "Staff account deleted successfully." });
  } catch (error) {
    console.error("Admin user delete error:", error);
    return res.status(500).json({
      error: FormatServerError(error, "Failed to delete user."),
    });
  }
});

app.get(["/items/manage", "/api/items/manage"], async (req, res) => {
  try {
    const user = await RequireStaffUser(req, res);

    if (!user) {
      return;
    }

    await ClearExpiredHolds();

    const q = SafeText(req.query.q).trim();
    const category = NormalizeManagedItemCategory(req.query.category);
    const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 200);
    const { sql, params } = BuildSearchQuery({
      q,
      category,
      availableOnly: false,
      sort: "title",
      limit,
    });

    const [rows] = await pool.query(sql, params);

    return res.json(
      rows.map((row) => ({
        ...row,
        totalCopies:
          Number(row.available ?? 0) +
          Number(row.onHold ?? 0) +
          Number(row.unavailable ?? 0),
      }))
    );
  } catch (error) {
    console.error("Managed items list error:", error);
    return res.status(500).json({
      error: FormatServerError(error, "Failed to load items."),
    });
  }
});

app.get(["/items/manage/:itemId", "/api/items/manage/:itemId"], async (req, res) => {
  try {
    const user = await RequireStaffUser(req, res);

    if (!user) {
      return;
    }

    await ClearExpiredHolds();

    const itemId = ParsePositiveInteger(req.params.itemId);

    if (!itemId) {
      return res.status(400).json({ error: "A valid item ID is required." });
    }

    const detail = await GetManagedItemDetail(itemId);

    if (!detail) {
      return res.status(404).json({ error: "Item not found." });
    }

    return res.json(detail);
  } catch (error) {
    console.error("Managed item detail error:", error);
    return res.status(500).json({
      error: FormatServerError(error, "Failed to load item."),
    });
  }
});

app.put(["/items/manage/:itemId", "/api/items/manage/:itemId"], async (req, res) => {
  let connection;

  try {
    const user = await RequireStaffUser(req, res);

    if (!user) {
      return;
    }

    await ClearExpiredHolds();

    const itemId = ParsePositiveInteger(req.params.itemId);

    if (!itemId) {
      return res.status(400).json({ error: "A valid item ID is required." });
    }

    const existingItem = await GetManagedItemBaseRow(itemId);

    if (!existingItem || !existingItem.category) {
      return res.status(404).json({ error: "Item not found." });
    }

    const totalCopies = ParsePositiveInteger(req.body?.totalCopies);
    const lockedCopies =
      Number(existingItem.onHold ?? 0) + Number(existingItem.unavailable ?? 0);

    if (!totalCopies) {
      return res.status(400).json({ error: "Enter a valid total copies value." });
    }

    if (totalCopies < lockedCopies) {
      return res.status(400).json({
        error: `Total copies cannot be less than ${lockedCopies} while copies are on hold or unavailable.`,
      });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    await connection.query(
      `
      UPDATE items
      SET available = ?
      WHERE item_id = ?
      `,
      [totalCopies - lockedCopies, itemId]
    );

    if (existingItem.category === "book") {
      const title = NormalizeRequiredText(req.body?.title, 45);
      const shelfNumber = ParsePositiveInteger(req.body?.shelfNumber);
      const genreCode = ParsePositiveInteger(req.body?.genreCode);
      const languageCode = ParsePositiveInteger(req.body?.languageCode);
      const formatCode = ParsePositiveInteger(req.body?.formatCode);
      const publisher = NormalizeRequiredText(req.body?.publisher, 50);
      const publicationDate = NormalizeDateInput(req.body?.publicationDate);
      const summary = NormalizeRequiredText(req.body?.summary, 1000);
      const authorFirstName = NormalizeRequiredText(req.body?.authorFirstName, 30);
      const authorLastName = NormalizeRequiredText(req.body?.authorLastName, 30);

      if (
        !title ||
        !shelfNumber ||
        !genreCode ||
        !languageCode ||
        !formatCode ||
        !publisher ||
        !publicationDate ||
        !summary ||
        !authorFirstName ||
        !authorLastName
      ) {
        await connection.rollback();
        return res.status(400).json({ error: "Missing or invalid book fields." });
      }

      await connection.query(
        `
        UPDATE books
        SET title = ?,
            shelf_number = ?,
            genre_code = ?,
            language_code = ?,
            book_type_code = ?,
            publisher = ?,
            publication_date = ?,
            summary = ?
        WHERE item_id = ?
        `,
        [
          title,
          shelfNumber,
          genreCode,
          languageCode,
          formatCode,
          publisher,
          publicationDate,
          summary,
          itemId,
        ]
      );

      const [authorRows] = await connection.query(
        `
        SELECT author_id AS authorId
        FROM authors
        WHERE item_id = ?
        ORDER BY author_id ASC
        LIMIT 1
        `,
        [itemId]
      );

      if (authorRows.length > 0) {
        await connection.query(
          `
          UPDATE authors
          SET first_name = ?,
              last_name = ?
          WHERE author_id = ?
          `,
          [authorFirstName, authorLastName, authorRows[0].authorId]
        );
      } else {
        await connection.query(
          `
          INSERT INTO authors (item_id, first_name, last_name)
          VALUES (?, ?, ?)
          `,
          [itemId, authorFirstName, authorLastName]
        );
      }
    } else if (existingItem.category === "periodical") {
      const title = NormalizeRequiredText(req.body?.title, 45);
      const shelfNumber = ParsePositiveInteger(req.body?.shelfNumber);
      const genreCode = ParsePositiveInteger(req.body?.genreCode);
      const languageCode = ParsePositiveInteger(req.body?.languageCode);
      const formatCode = ParsePositiveInteger(req.body?.formatCode);
      const publisher = NormalizeRequiredText(req.body?.publisher, 50);
      const publicationDate = NormalizeDateInput(req.body?.publicationDate);
      const summary = NormalizeRequiredText(req.body?.summary, 1000);

      if (
        !title ||
        !shelfNumber ||
        !genreCode ||
        !languageCode ||
        !formatCode ||
        !publisher ||
        !publicationDate ||
        !summary
      ) {
        await connection.rollback();
        return res.status(400).json({ error: "Missing or invalid periodical fields." });
      }

      await connection.query(
        `
        UPDATE periodicals
        SET title = ?,
            shelf_number = ?,
            genre_code = ?,
            language_code = ?,
            periodical_type_code = ?,
            publisher = ?,
            publication_date = ?,
            summary = ?
        WHERE item_id = ?
        `,
        [
          title,
          shelfNumber,
          genreCode,
          languageCode,
          formatCode,
          publisher,
          publicationDate,
          summary,
          itemId,
        ]
      );
    } else if (existingItem.category === "audiovisualmedia") {
      const title = NormalizeRequiredText(req.body?.title, 45);
      const shelfNumber = ParsePositiveInteger(req.body?.shelfNumber);
      const genreCode = ParsePositiveInteger(req.body?.genreCode);
      const languageCode = ParsePositiveInteger(req.body?.languageCode);
      const formatCode = ParsePositiveInteger(req.body?.formatCode);
      const publisher = NormalizeRequiredText(req.body?.publisher, 50);
      const publicationDate = NormalizeDateInput(req.body?.publicationDate);
      const summary = NormalizeRequiredText(req.body?.summary, 1000);
      const runtime = ParsePositiveInteger(req.body?.runtime);

      if (
        !title ||
        !shelfNumber ||
        !genreCode ||
        !languageCode ||
        !formatCode ||
        !publisher ||
        !publicationDate ||
        !summary ||
        !runtime
      ) {
        await connection.rollback();
        return res.status(400).json({
          error: "Missing or invalid audiovisual media fields.",
        });
      }

      await connection.query(
        `
        UPDATE audiovisual_media
        SET title = ?,
            shelf_number = ?,
            genre_code = ?,
            language_code = ?,
            audiovisual_media_type_code = ?,
            publisher = ?,
            publication_date = ?,
            summary = ?,
            runtime = ?
        WHERE item_id = ?
        `,
        [
          title,
          shelfNumber,
          genreCode,
          languageCode,
          formatCode,
          publisher,
          publicationDate,
          summary,
          runtime,
          itemId,
        ]
      );
    } else {
      const title = NormalizeRequiredText(req.body?.title, 20);

      if (!title) {
        await connection.rollback();
        return res.status(400).json({ error: "Enter a valid equipment name." });
      }

      await connection.query(
        `
        UPDATE equipment
        SET equipment_name = ?
        WHERE item_id = ?
        `,
        [title, itemId]
      );
    }

    await connection.commit();

    return res.json({ message: "Item updated successfully." });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error("Managed item update error:", error);
    return res.status(500).json({
      error: FormatServerError(error, "Failed to update item."),
    });
  } finally {
    connection?.release();
  }
});

app.delete(["/items/manage/:itemId", "/api/items/manage/:itemId"], async (req, res) => {
  let connection;

  try {
    const user = await RequireStaffUser(req, res);

    if (!user) {
      return;
    }

    await ClearExpiredHolds();

    const itemId = ParsePositiveInteger(req.params.itemId);

    if (!itemId) {
      return res.status(400).json({ error: "A valid item ID is required." });
    }

    const existingItem = await GetManagedItemBaseRow(itemId);

    if (!existingItem || !existingItem.category) {
      return res.status(404).json({ error: "Item not found." });
    }

    const [usageRows] = await pool.query(
      `
      SELECT
        (SELECT COUNT(*) FROM holds WHERE item_id = ?) AS holdCount,
        (SELECT COUNT(*) FROM loans WHERE item_id = ?) AS loanCount
      `,
      [itemId, itemId]
    );

    const usage = usageRows[0] ?? {};

    if (Number(usage.holdCount) > 0 || Number(usage.loanCount) > 0) {
      return res.status(400).json({
        error: "This item has hold or loan history and cannot be deleted.",
      });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    if (existingItem.category === "book") {
      await connection.query(`DELETE FROM authors WHERE item_id = ?`, [itemId]);
      await connection.query(`DELETE FROM books WHERE item_id = ?`, [itemId]);
    } else if (existingItem.category === "periodical") {
      await connection.query(`DELETE FROM periodicals WHERE item_id = ?`, [itemId]);
    } else if (existingItem.category === "audiovisualmedia") {
      await connection.query(`DELETE FROM contributors WHERE item_id = ?`, [itemId]);
      await connection.query(`DELETE FROM audiovisual_media WHERE item_id = ?`, [itemId]);
    } else {
      await connection.query(`DELETE FROM equipment WHERE item_id = ?`, [itemId]);
    }

    await connection.query(`DELETE FROM items WHERE item_id = ?`, [itemId]);
    await connection.commit();

    return res.json({ message: "Item deleted successfully." });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error("Managed item delete error:", error);
    return res.status(500).json({
      error: FormatServerError(error, "Failed to delete item."),
    });
  } finally {
    connection?.release();
  }
});

//
// update patron roles
app.put(["/changerole", "/api/changerole"], async (req, res) => {
  try {
    const user = await RequireStaffUser(req, res, { adminOnly: true });

    if (!user) {
      return;
    }

    const {
      patronId,
      role,
    } = req.body;
    if (
      !patronId ||
      !role
    ) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    await pool.query(`
      UPDATE patrons
      SET patron_role_code = ?
      WHERE patron_id = ?
      `,
      [role, patronId])
    res.status(201).json({ message: "Patron role changed successfully." });
  } catch (error) {
    console.error("Patron role change error:", error);
    res.status(500).json({
      error: FormatServerError(error, "Failed to change patron role."),
    });
  }
})

// Item insertion stuff
// get values for dropdowns
// // get roles
app.get(["/patronroles", "/api/patronroles"], async (req, res) => {
  try {
    const user = await RequireStaffUser(req, res, { adminOnly: true });

    if (!user) {
      return;
    }

    const [rows] = await pool.query(
      `SELECT * FROM patron_roles WHERE patron_role_code NOT IN (2,3) ORDER BY patron_role_code ASC`,
    );
    res.json(rows);
  } catch (error) {
    SendServerError(res, error, "Internal Server Error");
  }
});
app.get(["/staffroles", "/api/staffroles"], async (req, res) => {
  try {
    const user = await RequireStaffUser(req, res, { adminOnly: true });

    if (!user) {
      return;
    }

    const [rows] = await pool.query(
      `SELECT * FROM staff_roles ORDER BY staff_role_code ASC`,
    );
    res.json(rows);
  } catch (error) {
    SendServerError(res, error, "Internal Server Error");
  }
});
// get languages
app.get(["/languages", "/api/languages"], async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM languages ORDER BY language_code ASC`,
    );
    res.json(rows);
  } catch (error) {
    SendServerError(res, error, "Internal Server Error");
  }
});
// get genres
app.get(["/genres", "/api/genres"], async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM genres ORDER BY genre_code ASC`,
    );
    res.json(rows);
  } catch (error) {
    SendServerError(res, error, "Internal Server Error");
  }
});
// get book formats
app.get(["/book_types", "/api/book_types"], async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM book_types ORDER BY book_type_code ASC`,
    );
    res.json(rows);
  } catch (error) {
    SendServerError(res, error, "Internal Server Error");
  }
});
// get periodical formats
app.get(["/periodical_types", "/api/periodical_types"], async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM periodical_types ORDER BY periodical_type_code ASC`,
    );
    res.json(rows);
  } catch (error) {
    SendServerError(res, error, "Internal Server Error");
  }
});
// get avm formats
app.get(
  ["/audiovisual_media_types", "/api/audiovisual_media_types"],
  async (req, res) => {
    try {
      const [rows] = await pool.query(
        `SELECT * FROM audiovisual_media_types ORDER BY audiovisual_media_type_code ASC`,
      );
      res.json(rows);
    } catch (error) {
      SendServerError(res, error, "Internal Server Error");
    }
  },
);

// item insertion
// book insertion
app.post(["/itementry/book", "/api/itementry/book"], async (req, res) => {
  try {
    const user = await RequireStaffUser(req, res);

    if (!user) {
      return;
    }

    const {
      title,
      available,
      shelfnumber,
      genre,
      language,
      format,
      authorfirstname,
      authorlastname,
      publisher,
      publicationdate,
      summary,
    } = req.body;
    if (
      !title ||
      !available ||
      !shelfnumber ||
      !genre ||
      !language ||
      !format ||
      !authorfirstname ||
      !authorlastname ||
      !publisher ||
      !publicationdate ||
      !summary
    ) {
      return res.status(400).json({ error: "Missing required fields." });
    }
    const trimmmedtitle = title.trim();
    const trimmmedauthorfirstname = authorfirstname.trim();
    const trimmmedauthorlastname = authorlastname.trim();
    const trimmmedpublisher = publisher.trim();
    const trimmmedsummary = summary.trim();
    const TITLEPATTERN = /[\s\S]{1,45}/;
    const PUBLISHERPATTERN = /[\s\S]{1,50}/;
    const AUTHORPATTERN = /[\s\S]{1,30}/;
    const SUMMARYPATTERN = /[\s\S]{1,1000}/;

    // double-checking given data is proper format
    if (
      !(
        TITLEPATTERN.test(trimmmedtitle) &&
        PUBLISHERPATTERN.test(trimmmedpublisher) &&
        AUTHORPATTERN.test(trimmmedauthorfirstname) &&
        AUTHORPATTERN.test(trimmmedauthorlastname) &&
        SUMMARYPATTERN.test(trimmmedsummary)
      )
    ) {
      return res.status(400).json({ error: "Error with form data." });
    }

    // insert base item
    const [item] = await pool.query(
      `INSERT INTO items (
      available, on_hold, unavailable) VALUES(?,?,?)`,
      [available, 0, 0],
    );
    const itemId = item.insertId;

    await pool.query(
      `
      INSERT INTO books
        (
          item_id,
          title,
          shelf_number,
          genre_code,
          language_code,
          book_type_code,
          publisher,
          publication_date,
          summary
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        itemId,
        trimmmedtitle,
        shelfnumber,
        genre,
        language,
        format,
        trimmmedpublisher,
        publicationdate,
        trimmmedsummary,
      ],
    );
    await pool.query(
      `INSERT INTO authors (item_id, first_name,last_name) VALUES(?,?,?)`,
      [itemId, trimmmedauthorfirstname, trimmmedauthorlastname],
    );
    res.status(201).json({ message: "Book insertion successful." });
  } catch (error) {
    console.error("Book insertion error:", error);
    res.status(500).json({
      error: FormatServerError(error, "Book insertion failed."),
    });
  }
});
// avm insertion
app.post(
  ["/itementry/audiovisual_media", "/api/itementry/audiovisual_media"],
  async (req, res) => {
    try {
      const user = await RequireStaffUser(req, res);

      if (!user) {
        return;
      }

      const {
        title,
        available,
        shelfnumber,
        runtime,
        genre,
        language,
        format,
        publisher,
        publicationdate,
        summary,
      } = req.body;
      if (
        (title,
          !available ||
          !shelfnumber ||
          !runtime ||
          !genre ||
          !language ||
          !format ||
          !publisher ||
          !publicationdate ||
          !summary)
      ) {
        return res.status(400).json({ error: "Missing required fields." });
      }
      const trimmmedtitle = title.trim();
      const trimmmedpublisher = publisher.trim();
      const trimmmedsummary = summary.trim();
      const TITLEPATTERN = /[\s\S]{1,45}/;
      const PUBLISHERPATTERN = /[\s\S]{1,50}/;
      const SUMMARYPATTERN = /[\s\S]{1,1000}/;

      // double-checking given data is proper format
      if (
        !(
          TITLEPATTERN.test(trimmmedtitle) &&
          PUBLISHERPATTERN.test(trimmmedpublisher) &&
          SUMMARYPATTERN.test(trimmmedsummary)
        )
      ) {
        return res.status(400).json({ error: "Error with form data." });
      }

      // insert base item
      const [item] = await pool.query(
        `INSERT INTO items (
      available, on_hold, unavailable) VALUES(?,?,?)`,
        [available, 0, 0],
      );
      const itemId = item.insertId;

      await pool.query(
        `
      INSERT INTO audiovisual_media
        (
          item_id,
          title,
          shelf_number,
          genre_code,
          runtime,
          language_code,
          audiovisual_media_type_code,
          publisher,
          publication_date,
          summary
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          itemId,
          trimmmedtitle,
          shelfnumber,
          genre,
          runtime,
          language,
          format,
          trimmmedpublisher,
          publicationdate,
          trimmmedsummary,
        ],
      );
      res
        .status(201)
        .json({ message: "audiovisualmedia insertion successful." });
    } catch (error) {
      console.error("audiovisualmedia insertion error:", error);
      res.status(500).json({
        error: FormatServerError(error, "audiovisualmedia insertion failed."),
      });
    }
  },
);

// periodical insertion
app.post(["/itementry/periodical", "/api/itementry/periodical"], async (req, res) => {
  try {
    const user = await RequireStaffUser(req, res);

    if (!user) {
      return;
    }

    const {
      title,
      available,
      shelfnumber,
      genre,
      language,
      format,
      publisher,
      publicationdate,
      summary,
    } = req.body;
    if (
      !title ||
      !available ||
      !shelfnumber ||
      !genre ||
      !language ||
      !format ||
      !publisher ||
      !publicationdate ||
      !summary
    ) {
      return res.status(400).json({ error: "Missing required fields." });
    }
    const trimmmedtitle = title.trim();
    const trimmmedpublisher = publisher.trim();
    const trimmmedsummary = summary.trim();
    const TITLEPATTERN = /[\s\S]{1,45}/;
    const PUBLISHERPATTERN = /[\s\S]{1,50}/;
    const SUMMARYPATTERN = /[\s\S]{1,1000}/;

    // double-checking given data is proper format
    if (
      !(
        TITLEPATTERN.test(trimmmedtitle) &&
        PUBLISHERPATTERN.test(trimmmedpublisher) &&
        SUMMARYPATTERN.test(trimmmedsummary)
      )
    ) {
      return res.status(400).json({ error: "Error with form data." });
    }

    // insert base item
    const [item] = await pool.query(
      `INSERT INTO items (
      available, on_hold, unavailable) VALUES(?,?,?)`,
      [available, 0, 0],
    );
    const itemId = item.insertId;

    await pool.query(
      `
      INSERT INTO periodicals
        (
          item_id,
          title,
          shelf_number,
          genre_code,
          language_code,
          periodical_type_code,
          publisher,
          publication_date,
          summary
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        itemId,
        trimmmedtitle,
        shelfnumber,
        genre,
        language,
        format,
        trimmmedpublisher,
        publicationdate,
        trimmmedsummary,
      ],
    );
    res.status(201).json({ message: "Periodical insertion successful." });
  } catch (error) {
    console.error("Periodical insertion error:", error);
    res.status(500).json({
      error: FormatServerError(error, "Periodical insertion failed."),
    });
  }
});

// equipment insertion
app.post(
  ["/itementry/equipment", "/api/itementry/equipment"],
  async (req, res) => {
    try {
      const user = await RequireStaffUser(req, res);

      if (!user) {
        return;
      }

      const { title, available } = req.body;
      if (!title || !available) {
        return res.status(400).json({ error: "Missing required fields." });
      }

      // insert base item
      const [item] = await pool.query(
        `INSERT INTO items (
      available, on_hold, unavailable) VALUES(?,?,?)`,
        [available, 0, 0],
      );
      const itemId = item.insertId;

      await pool.query(
        `
      INSERT INTO equipment
        (
          item_id,
          equipment_name
        )
      VALUES
        (?, ?)
      `,
        [itemId, title],
      );
      res.status(201).json({ message: "Equipment insertion successful." });
    } catch (error) {
      console.error("Equipment insertion error:", error);
      res.status(500).json({
        error: FormatServerError(error, "Equipment insertion failed."),
      });
    }
  },
);

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

app.post(["/forgot-password", "/api/forgot-password"], async (req, res) => {
  try {
    const email = String(req.body?.email ?? "").trim();

    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    const responsePayload = {
      message:
        "If an active account with that email exists, a password reset link has been prepared.",
    };
    const account = await FindPasswordResetAccountByEmail(email);

    if (!account || !account.isActive) {
      return res.json(responsePayload);
    }

    const resetToken = BuildPasswordResetToken({
      userType: account.userType,
      patronId: account.patronId,
      staffId: account.staffId,
      passwordHash: account.passwordHash,
    });

    if (process.env.NODE_ENV !== "production") {
      responsePayload.delivery = "preview";
      responsePayload.expiresAt = resetToken.expiresAt;
      responsePayload.resetToken = resetToken.token;
      responsePayload.resetUrl = `${GetApplicationOrigin(req)}/forgotpassword?token=${encodeURIComponent(resetToken.token)}`;
    }

    return res.json(responsePayload);
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      error: FormatServerError(error, "Failed to start password reset."),
    });
  }
});

app.post(["/reset-password", "/api/reset-password"], async (req, res) => {
  try {
    const token = String(req.body?.token ?? "").trim();
    const newPassword = String(req.body?.newPassword ?? "");
    const confirmPassword = String(req.body?.confirmPassword ?? "");

    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({
        error: "Token, new password, and confirmation are required.",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match." });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        error: "New password must be at least 8 characters long.",
      });
    }

    const parsedToken = ParsePasswordResetToken(token);

    if (!parsedToken) {
      return res.status(400).json({
        error: "This password reset link is invalid or has expired.",
      });
    }

    const account = await FindPasswordResetAccountBySubject({
      userType: parsedToken.userType,
      subjectId: parsedToken.subjectId,
    });

    if (!account || !account.isActive) {
      return res.status(400).json({
        error: "This password reset link is invalid or has expired.",
      });
    }

    if (
      BuildPasswordResetFingerprint(account.passwordHash) !==
      parsedToken.passwordDigest
    ) {
      return res.status(400).json({
        error: "This password reset link has already been used or is no longer valid.",
      });
    }

    const passwordMatchesCurrent = await VerifyPassword(
      newPassword,
      account.passwordHash,
    );

    if (passwordMatchesCurrent) {
      return res.status(400).json({
        error: "Choose a password that is different from your current password.",
      });
    }

    const nextPasswordHash = HashPassword(newPassword);
    const tableName = account.userType === "patron" ? "patrons" : "staff";
    const idColumn = account.userType === "patron" ? "patron_id" : "staff_id";
    const idValue = account.userType === "patron"
      ? account.patronId
      : account.staffId;

    await pool.query(
      `
      UPDATE ${tableName}
      SET password_hash = ?
      WHERE ${idColumn} = ?
      `,
      [nextPasswordHash, idValue]
    );

    return res.json({
      message: "Password reset successful. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      error: FormatServerError(error, "Failed to reset password."),
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
      const [existingFines] = await pool.query(
        `
        SELECT fine_id AS fineId, waived_date AS waivedDate
        FROM fines
        WHERE loan_id = ?
        ORDER BY fine_id DESC
        LIMIT 1
        `,
        [loan.loanId]
      );

      if (existingFines.length > 0 && !existingFines[0].waivedDate) {
        await pool.query(
          `
          UPDATE fines
          SET fine_amount = ?
          WHERE fine_id = ?
          `,
          [fineAmount, existingFines[0].fineId]
        );
      } else {
        await pool.query(
          `
          INSERT INTO fines
            (patron_id, loan_id, fine_amount, fine_date, paid_amount)
          VALUES
            (?, ?, ?, CURDATE(), 0)
          `,
          [loan.patronId, loan.loanId, fineAmount]
        );
      }
    }

    await pool.query(
      `
      UPDATE loans
      SET loan_status_code = 2,
      return_date = CURRENT_DATE
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
        COALESCE(f.fine_amount, 0) AS fineAmount,
        COALESCE(f.paid_amount, 0) AS paidAmount,
        ROUND(COALESCE(f.fine_amount, 0) - COALESCE(f.paid_amount, 0), 2) AS remainingAmount,
        f.fine_date AS fineDate,
        f.paid_date AS paidDate,
        f.waived_date AS waivedDate,
        l.item_id AS itemId,
        l.loan_origin_date AS loanStartDate,
        l.loan_due_date AS loanDueDate,
        l.loan_status_code AS loanStatusCode,
        p.first_name AS firstName,
        p.last_name AS lastName,
        pr.fine AS dailyFine,
        GREATEST(DATEDIFF(CURDATE(), l.loan_due_date), 0) AS daysOverdue,
        CASE
          WHEN f.waived_date IS NOT NULL THEN 'Waived'
          WHEN ROUND(COALESCE(f.fine_amount, 0) - COALESCE(f.paid_amount, 0), 2) <= 0 THEN 'Paid'
          WHEN l.loan_status_code = 1 AND l.loan_due_date < CURDATE() THEN 'Overdue'
          WHEN l.loan_status_code <> 1 AND ROUND(COALESCE(f.fine_amount, 0) - COALESCE(f.paid_amount, 0), 2) > 0 THEN 'Returned but unpaid'
          ELSE 'Paid'
        END AS fineStatus,
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
      FROM fines f
      JOIN loans l ON l.loan_id = f.loan_id
      JOIN patrons p ON p.patron_id = f.patron_id
      JOIN patron_roles pr ON pr.patron_role_code = l.patron_role_code
      LEFT JOIN books b ON b.item_id = l.item_id
      LEFT JOIN periodicals per ON per.item_id = l.item_id
      LEFT JOIN audiovisual_media am ON am.item_id = l.item_id
      LEFT JOIN equipment e ON e.item_id = l.item_id
      ORDER BY
        CASE
          WHEN f.waived_date IS NOT NULL THEN 4
          WHEN ROUND(COALESCE(f.fine_amount, 0) - COALESCE(f.paid_amount, 0), 2) <= 0 THEN 3
          WHEN l.loan_status_code = 1 AND l.loan_due_date < CURDATE() THEN 1
          WHEN l.loan_status_code <> 1 AND ROUND(COALESCE(f.fine_amount, 0) - COALESCE(f.paid_amount, 0), 2) > 0 THEN 2
          ELSE 5
        END ASC,
        remainingAmount DESC,
        l.loan_due_date ASC,
        f.fine_id DESC
      `
    );

    const formattedRows = rows.map((row) => ({
      ...row,
      patronName: `${row.firstName} ${row.lastName}`,
    }));

    return res.json(formattedRows);
  } catch (error) {
    return res.status(500).json({
      error: FormatServerError(error, "Failed to load current fines."),
    });
  }
});

// Pay fine endpoint
app.post(["/fines/:fineId/pay", "/api/fines/:fineId/pay"], async (req, res) => {
  try {
    const user = await RequireAuthenticatedUser(req, res);

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
        patron_id AS patronId,
        COALESCE(fine_amount, 0) AS fineAmount,
        COALESCE(paid_amount, 0) AS paidAmount,
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

    if (user.userType === "patron" && fine.patronId !== user.patronId) {
      return res.status(403).json({ error: "You can only pay fines on your own account." });
    }

    if (user.userType === "staff" && ![1, 2].includes(user.roleCode)) {
      return res.status(403).json({ error: "Your staff account does not have access." });
    }

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

function SafeText(value) {
  return value == null ? "" : String(value);
}


// Get populity report
app.get(["/reports/popularity", "/api/reports/popularity"], async (req, res) => {
  try {
    const user = await RequireStaffUser(req, res);

    if (!user) {
      return;
    }

    const roleCode = Number(
      user.roleCode ??
      user.role ??
      user.role_code ??
      user.staff_role_code ??
      user.staffRoleCode ??
      0
    );

    if (roleCode !== 2) {
      return res.status(403).json({
        error: "Only admin can access the popularity report.",
      });
    }

    const startDate = SafeText(req.query.startDate).trim();
    const endDate = SafeText(req.query.endDate).trim();

    const filters = [];
    let dateClause = "";

    if (startDate) {
      dateClause += " AND l.loan_origin_date >= ? ";
      filters.push(startDate);
    }

    if (endDate) {
      dateClause += " AND l.loan_origin_date <= ? ";
      filters.push(endDate);
    }

    const [rows] = await pool.query(
      `
      SELECT
        l.item_id AS itemId,
        COALESCE(
          b.title,
          per.title,
          am.title,
          e.equipment_name
        ) AS title,
        CASE
          WHEN b.item_id IS NOT NULL THEN 'Book'
          WHEN per.item_id IS NOT NULL THEN 'Periodical'
          WHEN am.item_id IS NOT NULL THEN 'Audiovisual Media'
          WHEN e.item_id IS NOT NULL THEN 'Equipment'
          ELSE 'Other'
        END AS category,
        g.genre AS genre,
        COALESCE(
          b.publisher,
          per.publisher,
          am.publisher,
          NULL
        ) AS publisher,
        COALESCE(
          b.publication_date,
          per.publication_date,
          am.publication_date,
          NULL
        ) AS publicationDate,
        COALESCE(
          b.summary,
          per.summary,
          am.summary,
          NULL
        ) AS summary,
        COUNT(l.loan_id) AS loanCount,
        COALESCE(
          (
            SELECT GROUP_CONCAT(CONCAT(a.first_name, ' ', a.last_name) SEPARATOR ', ')
            FROM authors a
            WHERE b.item_id IS NOT NULL
              AND a.item_id = b.item_id
          ),
          (
            SELECT GROUP_CONCAT(CONCAT(c.first_name, ' ', c.last_name) SEPARATOR ', ')
            FROM contributors c
            WHERE am.item_id IS NOT NULL
              AND c.item_id = am.item_id
          ),
          NULL
        ) AS creator
      FROM loans l
      LEFT JOIN books b ON b.item_id = l.item_id
      LEFT JOIN periodicals per ON per.item_id = l.item_id
      LEFT JOIN audiovisual_media am ON am.item_id = l.item_id
      LEFT JOIN equipment e ON e.item_id = l.item_id
      LEFT JOIN genres g
        ON g.genre_code = COALESCE(
          b.genre_code,
          per.genre_code,
          am.genre_code
        )
      WHERE 1 = 1
        ${dateClause}
      GROUP BY
        l.item_id,
        b.item_id,
        per.item_id,
        am.item_id,
        e.item_id,
        b.title,
        per.title,
        am.title,
        e.equipment_name,
        g.genre,
        b.publisher,
        per.publisher,
        am.publisher,
        b.publication_date,
        per.publication_date,
        am.publication_date,
        b.summary,
        per.summary,
        am.summary
      ORDER BY loanCount DESC, title ASC
      `,
      filters
    );

    return res.json(rows);
  } catch (error) {
    console.error("Popularity report error:", error);
    return res.status(500).json({
      error: FormatServerError(error, "Failed to load popularity report."),
    });
  }
});

// Get popularity loan history for a specific item
app.get(
  ["/reports/popularity/:itemId/history", "/api/reports/popularity/:itemId/history"],
  async (req, res) => {
    try {
      const user = await RequireStaffUser(req, res);

      if (!user) {
        return;
      }

      const roleCode = Number(
        user.roleCode ??
        user.role ??
        user.role_code ??
        user.staff_role_code ??
        user.staffRoleCode ??
        0
      );

      if (roleCode !== 2) {
        return res.status(403).json({
          error: "Only admin can access popularity loan history.",
        });
      }

      const itemId = ParsePositiveInteger(req.params.itemId);

      if (!itemId) {
        return res.status(400).json({
          error: "A valid itemId is required.",
        });
      }

      const [rows] = await pool.query(
        `
        SELECT
          l.loan_id AS loanId,
          l.item_id AS itemId,
          l.patron_id AS patronId,
          p.first_name AS firstName,
          p.last_name AS lastName,
          l.loan_origin_date AS loanStartDate,
          l.loan_due_date AS loanDueDate,
          l.return_date AS returnDate,
          l.loan_status_code AS loanStatusCode
        FROM loans l
        JOIN patrons p ON p.patron_id = l.patron_id
        WHERE l.item_id = ?
        ORDER BY l.loan_origin_date DESC, l.loan_id DESC
        `,
        [itemId]
      );

      const formattedRows = rows.map((row) => ({
        ...row,
        patronName: `${row.firstName} ${row.lastName}`,
      }));

      return res.json(formattedRows);
    } catch (error) {
      console.error("Popularity loan history error:", error);
      return res.status(500).json({
        error: FormatServerError(error, "Failed to load loan history."),
      });
    }
  }
);


// Get patron summary report
app.get(["/reports/patron-summary", "/api/reports/patron-summary"], async (req, res) => {
  try {
    const user = await RequireStaffUser(req, res);

    if (!user) {
      return;
    }

    const roleCode = Number(
      user.roleCode ??
      user.role ??
      user.role_code ??
      user.staff_role_code ??
      user.staffRoleCode ??
      0
    );

    if (roleCode !== 2) {
      return res.status(403).json({
        error: "Only admin can access the patron summary report.",
      });
    }

    const [rows] = await pool.query(
      `
      SELECT
        p.patron_id AS patronId,
        p.first_name AS firstName,
        p.last_name AS lastName,

        COALESCE(ls.totalLoansHistory, 0) AS totalLoansHistory,
        COALESCE(ls.currentLoans, 0) AS currentLoans,
        COALESCE(ls.returnedLoans, 0) AS returnedLoans,
        ls.lastLoanDate AS lastLoanDate,
        ls.lastReturnDate AS lastReturnDate,

        COALESCE(hs.totalHoldsHistory, 0) AS totalHoldsHistory,
        COALESCE(hs.activeHolds, 0) AS activeHolds,
        hs.lastHoldDate AS lastHoldDate,

        COALESCE(fs.totalFineRecords, 0) AS totalFineRecords,
        COALESCE(fs.totalFineAmount, 0) AS totalFineAmount,
        COALESCE(fs.totalPaidAmount, 0) AS totalPaidAmount,
        COALESCE(fs.outstandingBalance, 0) AS outstandingBalance,
        COALESCE(fs.waivedFineCount, 0) AS waivedFineCount,
        fs.lastFineDate AS lastFineDate,

        NULLIF(
          GREATEST(
            COALESCE(ls.lastLoanDate, '1000-01-01'),
            COALESCE(hs.lastHoldDate, '1000-01-01'),
            COALESCE(fs.lastFineDate, '1000-01-01')
          ),
          '1000-01-01'
        ) AS lastActivityDate

      FROM patrons p

      LEFT JOIN (
        SELECT
          l.patron_id,
          COUNT(*) AS totalLoansHistory,
          SUM(CASE WHEN l.loan_status_code = 1 THEN 1 ELSE 0 END) AS currentLoans,
          SUM(CASE WHEN l.loan_status_code <> 1 THEN 1 ELSE 0 END) AS returnedLoans,
          MAX(l.loan_origin_date) AS lastLoanDate,
          MAX(l.return_date) AS lastReturnDate
        FROM loans l
        GROUP BY l.patron_id
      ) ls ON ls.patron_id = p.patron_id

      LEFT JOIN (
        SELECT
          h.patron_id,
          COUNT(*) AS totalHoldsHistory,
          SUM(
            CASE
              WHEN h.hold_status_code = 1 AND h.hold_expiration_date >= CURDATE()
              THEN 1
              ELSE 0
            END
          ) AS activeHolds,
          MAX(h.hold_origin_date) AS lastHoldDate
        FROM holds h
        GROUP BY h.patron_id
      ) hs ON hs.patron_id = p.patron_id

      LEFT JOIN (
        SELECT
          f.patron_id,
          COUNT(*) AS totalFineRecords,
          SUM(COALESCE(f.fine_amount, 0)) AS totalFineAmount,
          SUM(COALESCE(f.paid_amount, 0)) AS totalPaidAmount,
          SUM(
            CASE
              WHEN f.waived_date IS NULL
              THEN GREATEST(COALESCE(f.fine_amount, 0) - COALESCE(f.paid_amount, 0), 0)
              ELSE 0
            END
          ) AS outstandingBalance,
          SUM(CASE WHEN f.waived_date IS NOT NULL THEN 1 ELSE 0 END) AS waivedFineCount,
          MAX(f.fine_date) AS lastFineDate
        FROM fines f
        GROUP BY f.patron_id
      ) fs ON fs.patron_id = p.patron_id

      ORDER BY totalLoansHistory DESC, p.patron_id ASC
      `
    );

    const formattedRows = rows.map((row) => ({
      ...row,
      patronName: `${row.firstName} ${row.lastName}`,
    }));

    return res.json(formattedRows);
  } catch (error) {
    console.error("Patron summary report error:", error);
    return res.status(500).json({
      error: FormatServerError(error, "Failed to load patron summary report."),
    });
  }
});

// Mark loan as lost endpoint
app.post(["/loans/:loanId/mark-lost", "/api/loans/:loanId/mark-lost"], async (req, res) => {
  try {
    const user = await RequireStaffUser(req, res);
    if (!user) return;

    const loanId = ParsePositiveInteger(req.params.loanId);

    if (!loanId) {
      return res.status(400).json({ error: "Invalid loanId." });
    }

    const [loans] = await pool.query(
      `
      SELECT
        loan_id AS loanId,
        loan_status_code AS loanStatusCode,
        return_date AS returnDate
      FROM loans
      WHERE loan_id = ?
      `,
      [loanId]
    );

    if (loans.length === 0) {
      return res.status(404).json({ error: "Loan not found." });
    }

    const loan = loans[0];

    if (loan.returnDate) {
      return res.status(400).json({ error: "This loan has already been closed." });
    }

    await pool.query(
      `
      UPDATE loans
      SET loan_status_code = 4,
          return_date = CURRENT_DATE
      WHERE loan_id = ?
      `,
      [loanId]
    );

    return res.json({ message: "Loan marked as lost." });
  } catch (error) {
    console.error("Mark lost error:", error);
    return res.status(500).json({
      error: FormatServerError(error, "Failed to mark lost."),
    });
  }
});


// Get overdue items report
app.get(
  ["/reports/overdue-items", "/api/reports/overdue-items"],
  async (req, res) => {
    try {
      const user = await RequireStaffUser(req, res);

      if (!user) {
        return;
      }

      const startDate = req.query.startDate ?? null;
      const endDate = req.query.endDate ?? null;

      const params = [];

      let dateFilter = "";

      if (startDate) {
        dateFilter += " AND l.loan_due_date >= ?";
        params.push(startDate);
      }

      if (endDate) {
        dateFilter += " AND l.loan_due_date <= ?";
        params.push(endDate);
      }

      const [rows] = await pool.query(
        `
        SELECT
          l.loan_id AS loanId,
          l.item_id AS itemId,
          l.patron_id AS patronId,
          l.loan_origin_date AS loanStartDate,
          l.loan_due_date AS loanDueDate,
          l.return_date AS returnDate,

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
          ) AS creator,

          CASE
            WHEN b.item_id IS NOT NULL THEN 'Book'
            WHEN per.item_id IS NOT NULL THEN 'Periodical'
            WHEN am.item_id IS NOT NULL THEN 'Audiovisual Media'
            WHEN e.item_id IS NOT NULL THEN 'Equipment'
            ELSE 'Other'
          END AS category

        FROM loans l

        JOIN patrons p
          ON p.patron_id = l.patron_id

        JOIN patron_roles pr
          ON pr.patron_role_code = l.patron_role_code

        LEFT JOIN books b
          ON b.item_id = l.item_id

        LEFT JOIN periodicals per
          ON per.item_id = l.item_id

        LEFT JOIN audiovisual_media am
          ON am.item_id = l.item_id

        LEFT JOIN equipment e
          ON e.item_id = l.item_id

        WHERE l.loan_status_code = 1
          AND l.return_date IS NULL
          AND l.loan_due_date < CURDATE()
          ${dateFilter}

        ORDER BY
          daysOverdue DESC,
          currentFine DESC,
          l.loan_due_date ASC
        `,
        params
      );

      const formattedRows = rows.map((row) => ({
        ...row,
        patronName: `${row.firstName} ${row.lastName}`,
      }));

      return res.json(formattedRows);
    } catch (error) {
      console.error("Load overdue report error:", error);

      return res.status(500).json({
        error: FormatServerError(
          error,
          "Failed to load overdue report."
        ),
      });
    }

  }
);

// Get lost items report
app.get("/api/loans/lost", async (req, res) => {

  const user = await RequireStaffUser(req, res);
  if (!user) return;

  const [rows] = await pool.query(`
SELECT
l.loan_id AS loanId,
l.item_id AS itemId,
l.patron_id AS patronId,
l.return_date AS LostDate,
p.first_name,
p.last_name,

COALESCE(
b.title,
per.title,
am.title,
e.equipment_name
) AS title

FROM loans l

JOIN patrons p
ON p.patron_id = l.patron_id

LEFT JOIN books b ON b.item_id=l.item_id
LEFT JOIN periodicals per ON per.item_id=l.item_id
LEFT JOIN audiovisual_media am ON am.item_id=l.item_id
LEFT JOIN equipment e ON e.item_id=l.item_id

WHERE l.loan_status_code = 4
ORDER BY l.return_date DESC
`);

  const result = rows.map(r => ({
    ...r,
    patronName: `${r.first_name} ${r.last_name}`
  }));

  res.json(result);

});


// Mark found endpoint
app.post(["/loans/:loanId/found", "/api/loans/:loanId/found"], async (req, res) => {
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
        l.loan_status_code AS loanStatusCode,
        i.available AS available,
        i.unavailable AS unavailable,
        i.is_removed AS isRemoved
      FROM loans l
      JOIN items i ON i.item_id = l.item_id
      WHERE l.loan_id = ?
      `,
      [loanId]
    );

    if (loans.length === 0) {
      return res.status(404).json({ error: "Lost loan not found." });
    }

    const loan = loans[0];

    if (Number(loan.loanStatusCode) !== 4) {
      return res.status(400).json({ error: "Only lost items can be marked as found." });
    }

    if (Number(loan.isRemoved) === 1) {
      return res.status(400).json({ error: "This item has already been permanently removed." });
    }

    await pool.query(
      `
      UPDATE loans
      SET loan_status_code = 5,
          return_date = CURRENT_DATE
      WHERE loan_id = ?
      `,
      [loanId]
    );

    await pool.query(
      `
      UPDATE items
      SET available = available + 1,
          unavailable = CASE WHEN unavailable > 0 THEN unavailable - 1 ELSE 0 END
      WHERE item_id = ?
      `,
      [loan.itemId]
    );

    await pool.query(
      `
      INSERT INTO activity_logs
        (actor_type, actor_id, action_type, item_id, loan_id, description, created_at)
      VALUES
        ('staff', ?, 'lost_item_found', ?, ?, 'Lost item marked as found.', NOW())
      `,
      [user.staffId, loan.itemId, loanId]
    );

    return res.json({ message: "Item marked as found successfully." });
  } catch (error) {
    console.error("Mark found error:", error);
    return res.status(500).json({
      error: FormatServerError(error, "Failed to mark lost item as found."),
    });
  }
});

// Delete lost item endpoint
app.post(["/loans/:loanId/delete-lost", "/api/loans/:loanId/delete-lost"], async (req, res) => {
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
        l.loan_status_code AS loanStatusCode,
        i.is_removed AS isRemoved
      FROM loans l
      JOIN items i ON i.item_id = l.item_id
      WHERE l.loan_id = ?
      `,
      [loanId]
    );

    if (loans.length === 0) {
      return res.status(404).json({ error: "Lost loan not found." });
    }

    const loan = loans[0];

    if (Number(loan.loanStatusCode) !== 4) {
      return res.status(400).json({ error: "Only lost items can be permanently deleted." });
    }

    if (Number(loan.isRemoved) === 1) {
      return res.status(400).json({ error: "This item has already been permanently removed." });
    }

    await pool.query(
      `
      UPDATE loans
      SET loan_status_code = 6,
          return_date = CURRENT_DATE
      WHERE loan_id = ?
      `,
      [loanId]
    );

    await pool.query(
      `
      UPDATE items
      SET is_removed = 1,
          removed_reason = 'lost',
          removed_date = NOW(),
          available = 0,
          on_hold = 0,
          unavailable = 0
      WHERE item_id = ?
      `,
      [loan.itemId]
    );

    await pool.query(
      `
      INSERT INTO activity_logs
        (actor_type, actor_id, action_type, item_id, loan_id, description, created_at)
      VALUES
        ('staff', ?, 'lost_item_deleted', ?, ?, 'Lost item permanently removed.', NOW())
      `,
      [user.staffId, loan.itemId, loanId]
    );

    return res.json({ message: "Lost item permanently removed." });
  } catch (error) {
    console.error("Delete lost item error:", error);
    return res.status(500).json({
      error: FormatServerError(error, "Failed to permanently delete lost item."),
    });
  }
});


// Get lost items report
app.get(["/loans/lost", "/api/loans/lost"], async (req, res) => {
  try {
    const user = await RequireStaffUser(req, res);

    if (!user) {
      return;
    }

    const [rows] = await pool.query(`
      SELECT
        l.loan_id AS loanId,
        l.item_id AS itemId,
        l.patron_id AS patronId,
        l.return_date AS lostDate,
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
      WHERE l.loan_status_code = 4
      ORDER BY l.return_date DESC, l.loan_id DESC
    `);

    const result = rows.map((row) => ({
      ...row,
      patronName: `${row.first_name} ${row.last_name}`,
    }));

    return res.json(result);
  } catch (error) {
    console.error("Load lost loans error:", error);
    return res.status(500).json({
      error: FormatServerError(error, "Failed to load lost items."),
    });
  }
});

async function PermanentlyDelete(loanId) {
  const confirmed = window.confirm("Permanently remove this lost item?");
  if (!confirmed) {
    return;
  }

  try {
    await FetchJson(`/api/loans/${loanId}/delete-lost`, {
      method: "POST",
    });

    showSuccess("Item permanently removed.");
    await LoadLost();
  } catch (error) {
    console.error(error);
    showError(error.message || "Failed to permanently delete item.");
  }
}