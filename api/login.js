// api/login.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method not allowed");

  const { email, password } = req.body;

  try {
    const connection = await mysql.createConnection({
      host: "sql12.freesqldatabase.com",
      user: "sql12791474",
      password: "ux453dciIZ",
      database: "sql12791474",
    });

    const [rows] = await connection.execute(
      "SELECT * FROM user WHERE email = ? AND password = ?",
      [email, password]
    );

    await connection.end();

    if (rows.length > 0) {
      res.status(200).json({ message: "Login success" });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
