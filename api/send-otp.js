import nodemailer from "nodemailer";

let otpStore = {}; // You can replace this with a database or Redis in production

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method not allowed");

  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Store OTP temporarily
  otpStore[email] = otp;

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

export { otpStore }; // Export for use in verify API
