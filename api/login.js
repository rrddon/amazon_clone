import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { otpStore } from "./send-otp.js";  // ✅ Make sure the path is correct

dotenv.config();

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email, password, OTP } = req.body;

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    });

    const [rows] = await connection.execute(
      "SELECT * FROM user WHERE email = ? AND password = ?",
      [email, password]
    );

    if (rows.length === 0) {
      await connection.end();
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ✅ Use Map.get(email)
    const storedOtp = otpStore.get(email);

    if (storedOtp !== OTP) {
      await connection.end();
      return res.status(401).json({ message: "Invalid OTP" });
    }

    await connection.end();
    res.status(200).json({ message: "Login successful" });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Server error: " + error.message });
  }
}

