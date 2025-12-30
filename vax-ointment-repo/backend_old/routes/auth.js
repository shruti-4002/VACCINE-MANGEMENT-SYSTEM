
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const ResetToken = require('../models/ResetToken');
const { sendMail } = require('../utils/mailer');

// register
router.post('/register', async (req, res) => {
  const { name, email, password, phone } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User exists' });
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    user = await User.create({ name, email, password: hashed, phone });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) { console.error(err); res.status(500).send('Server error'); }
});

// login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { console.error(err); res.status(500).send('Server error'); }
});

// forgot password
router.post('/forgot', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(200).json({ message: 'If email exists, reset link sent' });
    const token = uuidv4();
    await ResetToken.create({ userId: user._id, token });
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    await sendMail({ to: user.email, subject: 'Password Reset', html: `<p>Click <a href="${resetLink}">here</a> to reset your password. Link expires in 1 hour.</p>` });
    res.json({ message: 'Reset link sent' });
  } catch (err) { console.error(err); res.status(500).send('Server error'); }
});

// reset password
router.post('/reset/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  try {
    const record = await ResetToken.findOne({ token });
    if (!record) return res.status(400).json({ message: 'Invalid or expired token' });
    const user = await User.findById(record.userId);
    if (!user) return res.status(400).json({ message: 'User not found' });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();
    await ResetToken.deleteOne({ token });
    res.json({ message: 'Password reset successful' });
  } catch (err) { console.error(err); res.status(500).send('Server error'); }
});

module.exports = router;
