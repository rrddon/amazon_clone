// api/login.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { otpStore } from "/send-otp.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method not allowed");

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

    const user = rows[0];
    
    const storedOtp = otpStore.get(email);

    if (storedOtp !== OTP) {
    await connection.end();
    return res.status(401).json({ message: "Invalid OTP" });
    }

    // ✅ Success
    await connection.end();
    res.status(200).json({ message: "Login successful" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
