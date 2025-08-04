// api/login.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { otpStore } from "./send-otp.js";  // ✅ correct path

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email, password, OTP } = req.body;

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

    if (rows.length === 0) {
      await connection.end();
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const storedOtp = otpStore.get(email); // ✅ Map get

    if (storedOtp !== OTP) {
      await connection.end();
      return res.status(401).json({ message: "Invalid OTP" });
    }

    await connection.end();
    res.status(200).json({ message: "Login successful" });

  } catch (error) {
    console.error("Login Error:", error);  // ✅ logs for debugging
    res.status(500).json({ error: "Server error: " + error.message });
  }
}
