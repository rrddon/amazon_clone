import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// ✅ Use Map instead of object
let otpStore = new Map();

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method not allowed");

  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // ✅ Store OTP with Map
  otpStore.set(email, otp);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}`,
    });

    res.status(200).json({ message: "OTP sent" });
  } catch (error) {
    res.status(500).json({ error: "Failed to send OTP" });
  }
}

// ✅ Export the Map
export { otpStore };

