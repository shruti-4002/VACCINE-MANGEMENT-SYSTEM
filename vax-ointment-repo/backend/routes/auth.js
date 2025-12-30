const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const User = require("../models/User");
const ResetToken = require("../models/ResetToken");
const { sendMail } = require("../utils/mailer");


// ===============================
// ✅ REGISTER USER
// ===============================
// -----------------------------------
// REGISTER USER / ADMIN
// -----------------------------------
router.post("/register", async (req, res) => {
  const { name, email, password, phone, role } = req.body; // ✅ accept role

  try {
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      phone,
      password: hashed,
      role: role === "admin" ? "admin" : "user", // ✅ SAFE ROLE ASSIGN
    });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role, // ✅ IMPORTANT
      }
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});


// ===============================
// ✅ LOGIN USER
// ===============================
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password)
      return res.status(400).json({ message: "Email & password required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ===============================
// ✅ FORGOT PASSWORD
// ===============================
router.post("/forgot", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    // ✅ SECURITY: Do not reveal user existence
    if (!user)
      return res.json({ message: "Reset link sent if email exists" });

    const token = uuidv4();

    await ResetToken.create({
      userId: user._id,
      token,
      expiresAt: Date.now() + 60 * 60 * 1000 // 1 hour
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    await sendMail({
      to: user.email,
      subject: "Password Reset",
      html: `
        <p>Hello ${user.name || user.email},</p>
        <p>Click below to reset your password:</p>
        <a href="${resetLink}" target="_blank">${resetLink}</a>
        <p>This link expires in 1 hour.</p>
      `
    });

    return res.json({ message: "Reset link sent to your email" });

  } catch (err) {
    console.error("FORGOT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ===============================
// ✅ RESET PASSWORD
// ===============================
router.post("/reset/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const record = await ResetToken.findOne({ token });

    if (!record || record.expiresAt < Date.now())
      return res.status(400).json({ message: "Invalid or expired reset link" });

    const user = await User.findById(record.userId);
    if (!user)
      return res.status(400).json({ message: "User not found" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    await ResetToken.deleteOne({ token });

    return res.json({ message: "Password reset successful" });

  } catch (err) {
    console.error("RESET ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ OTP LOGIN (DEMO)
router.post("/login-otp", async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const otp = Math.floor(100000 + Math.random() * 900000);

  // For demo → send OTP in response
  res.json({
    message: "OTP generated",
    otp,
    email
  });
});

// ✅ EXPORT
module.exports = router;
