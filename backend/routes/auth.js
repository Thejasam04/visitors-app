const express  = require('express');
const router   = express.Router();
const jwt      = require('jsonwebtoken');
const db       = require('../db');
const { sendOTP } = require('../services/email');
require('dotenv').config();

// Generate 6 digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ── POST /api/auth/send-otp ───────────────────────────
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const otp        = generateOTP();
    const expiresAt  = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    // Check if user exists
    const [existing] = await db.query(
      'SELECT id FROM users WHERE email = ?', [email]
    );

    if (existing.length > 0) {
      // Update OTP
      await db.query(
        'UPDATE users SET otp = ?, otp_expires_at = ? WHERE email = ?',
        [otp, expiresAt, email]
      );
    } else {
      // Create new user
      await db.query(
        'INSERT INTO users (email, otp, otp_expires_at) VALUES (?, ?, ?)',
        [email, otp, expiresAt]
      );
    }

    // Send OTP email
    await sendOTP(email, otp);

    res.json({ message: '✅ OTP sent to your email' });
  } catch (err) {
    console.error('Send OTP error:', err.message);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// ── POST /api/auth/verify-otp ─────────────────────────
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    // Find user
    const [rows] = await db.query(
      'SELECT * FROM users WHERE email = ?', [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = rows[0];

    // Check OTP
    if (user.otp !== otp) {
      return res.status(400).json({ error: '❌ Invalid OTP' });
    }

    // Check expiry
    if (new Date() > new Date(user.otp_expires_at)) {
      return res.status(400).json({ error: '❌ OTP has expired' });
    }

    // Mark as verified
    await db.query(
      'UPDATE users SET is_verified = TRUE, otp = NULL WHERE email = ?',
      [email]
    );

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message : '✅ Email verified successfully',
      token   : token,
      user    : { id: user.id, email: user.email }
    });
  } catch (err) {
    console.error('Verify OTP error:', err.message);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

module.exports = router;