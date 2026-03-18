import express from "express";
import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3000;

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

const patronId = 1;

app.get("/account", async (req, res) => {
    try {
        const [rows] = await pool.promise().query(
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
        const [rows] = await pool.promise().query(
            "SELECT * FROM fines WHERE patron_id = ?",
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
        const [rows] = await pool.promise().query(
            "SELECT * FROM loans WHERE patron_id = ?",
            [patronId]
        );

        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});