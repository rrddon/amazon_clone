import mysql from "mysql2/promise";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

// ✅ Audit logging function
async function logEvent(email, action, status, ip) {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    });

    await connection.execute(
      "INSERT INTO audit_logs (email, action, status, ip, timestamp) VALUES (?, ?, ?, ?, NOW())",
      [email, action, status, ip]
    );

    await connection.end();
  } catch (error) {
    console.error("Audit log error:", error);
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password, OTP } = req.body;
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress; // ✅ Capture IP

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    });

    const [rows] = await connection.execute(
      "SELECT * FROM user WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      await logEvent(email, "Login Attempt", "Failed - No user", ip);
      await connection.end();
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = rows[0];

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      await logEvent(email, "Login Attempt", "Failed - Wrong password", ip);
      await connection.end();
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.otp !== OTP) {
      await logEvent(email, "Login Attempt", "Failed - Wrong OTP", ip);
      await connection.end();
      return res.status(401).json({ message: "Invalid OTP" });
    }

    let redirectPage;
    if (user.role === "admin") {
      redirectPage = "amazon.html";
    } else {
      redirectPage = "no-amazon.html";
    }

    await logEvent(email, "Login Attempt", "Success", ip);
    await connection.end();

    return res.status(200).json({
      message: "Login successful",
      redirect: redirectPage
    });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ error: "Server error: " + error.message });
  }
}

