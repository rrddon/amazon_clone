import mysql from "mysql2/promise";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password, OTP } = req.body;

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
      await connection.end();
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = rows[0];

    // ✅ Check password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      await connection.end();
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ✅ Check OTP
    if (user.otp !== OTP) {
      await connection.end();
      return res.status(401).json({ message: "Invalid OTP" });
    }

    // ✅ Role-based redirection
    let redirectPage;
    if (user.role === "admin") {
      redirectPage = "amazon.html";
    } else {
      redirectPage = "no-amazon.html";
    }

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

