// api/signup.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method not allowed");

  const { email, username, password } = req.body;

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    await connection.query(
      "INSERT INTO user (email, username, password) VALUES (?, ?, ?)",
      [email, username, hashedPassword]
    );

    await connection.end();
    res.status(200).json({ message: "User registered" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

