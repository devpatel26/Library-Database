import express from "express";
import mysql from "mysql2";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcrypt";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3000;

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
})
.promise();

const patronId = 1;

const searchSorts = {
    title: "title ASC",
    newest: "publicationDate DESC, title ASC",
    availability: "available DESC, title ASC",
};

app.use(cors());
app.use(express.json());

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

app.get("/account", async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT * FROM patrons WHERE patron_id = ?",
            [patronId]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ error: "Patron not found" });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/fines", async (req, res) => {
  try {
    const [rows] = await pool.query(
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
        END AS status
      FROM fines
      WHERE patron_id = ?
      ORDER BY fine_date DESC, fine_id DESC
      `,
      [patronId]
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/loans", async (req, res) => {
  try {
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
      [patronId, patronId, patronId, patronId]
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
      [patronId, patronId, patronId, patronId]
    );

    res.json({ loans, holds });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/search", async (req, res) => {
    const q = String(req.query.q ?? "").trim();
    const category = String(req.query.category ?? "all").toLowerCase();
    const availableOnly = String(req.query.availableOnly ?? "false") === "true";
    const sort = String(req.query.sort ?? "title").toLowerCase();
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);

    try {
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
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Login endpoint
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const [users] = await pool.query(
      "SELECT * FROM patrons WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: "User not found" });
    }

    const user = users[0];

    if (!user.is_active) {
      return res.status(403).json({ error: "Account is inactive" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    res.json({
      message: "Login successful",
      user: {
        patron_id: user.patron_id,
        patron_role_code: user.patron_role_code,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});


// Registration endpoint
app.post("/register", async (req, res) => {
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

    const passwordHash = await bcrypt.hash(password, 10);

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
    res.status(500).json({ error: "Registration failed." });
  }
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
