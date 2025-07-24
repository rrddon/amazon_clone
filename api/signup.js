// api/signup.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method not allowed");

  const { email, username, password } = req.body;

  try {
    const connection = await mysql.createConnection({
      host: "sql12.freesqldatabase.com",
      user: "sql12791474",
      password: "ux453dciIZ",
      database: "sql12791474",
    });

    await connection.query(
      "INSERT INTO user (email, username, password) VALUES (?, ?, ?)",
      [email, username, password]
    );

    await connection.end();
    res.status(200).json({ message: "User registered" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
