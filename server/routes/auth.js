const express = require('express');
const router  = express.Router();
const crypto  = require('crypto');
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const { protect } = require('../middleware/auth');
const { sendServerError } = require('../utils/sendServerError');
const { sendPasswordResetEmail } = require('../services/emailService');

// Generate JWT
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// @route  POST /api/auth/register
// @desc   Register a new user
// @access Public
router.post('/register', async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password)
      return res.status(400).json({ message: 'Please fill all fields' });

    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already registered' });

    if (await User.findOne({ username }))
      return res.status(400).json({ message: 'Username already taken' });

    const user = await User.create({ name, username, email, password });

    res.status(201).json({
      _id:      user._id,
      name:     user.name,
      username: user.username,
      email:    user.email,
      token:    generateToken(user._id),
    });
  } catch (err) {
    return sendServerError(res, 'Auth registration failed', err, 'Unable to register user');
  }
});

// @route  POST /api/auth/login
// @desc   Login user
// @access Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });

    res.json({
      _id:      user._id,
      name:     user.name,
      username: user.username,
      email:    user.email,
      token:    generateToken(user._id),
    });
  } catch (err) {
    return sendServerError(res, 'Auth login failed', err, 'Unable to sign in');
  }
});

// @route  POST /api/auth/forgot-password
// @desc   Request a password reset link
// @access Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (user) {
      // 32-byte cryptographic random token (64 hex characters)
      const rawToken = crypto.randomBytes(32).toString('hex');
      // Store only the SHA-256 hash in database
      const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiration
      await user.save();

      const clientOrigin = req.headers.origin || (process.env.FRONTEND_ORIGIN_ALLOWLIST ? process.env.FRONTEND_ORIGIN_ALLOWLIST.split(',')[0] : 'http://localhost:5173');
      const resetUrl = `${clientOrigin}/reset-password/${rawToken}`;

      await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        resetUrl,
      });
    }

    // Always return generic response to prevent account/email enumeration
    return res.status(200).json({
      message: 'If an account with that email exists, password reset instructions have been sent.',
    });
  } catch (err) {
    return sendServerError(res, 'Forgot password request failed', err, 'Unable to process password reset request');
  }
});

// @route  GET /api/auth/verify-reset-token/:token
// @desc   Check if a reset token is valid and active
// @access Public
router.get('/verify-reset-token/:token', async (req, res) => {
  try {
    const { token } = req.params;

    if (!token || typeof token !== 'string' || token.length < 16) {
      return res.status(400).json({ valid: false, message: 'Invalid or missing reset token' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ valid: false, message: 'Password reset token is invalid or has expired.' });
    }

    return res.status(200).json({ valid: true, message: 'Token is valid' });
  } catch (err) {
    return sendServerError(res, 'Verify reset token failed', err, 'Unable to verify reset token');
  }
});

// @route  POST /api/auth/reset-password/:token
// @desc   Reset password using valid reset token
// @access Public
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ message: 'Invalid or missing reset token' });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired password reset token. Please request a new link.' });
    }

    // Set new password (Mongoose pre-save hook will hash it with bcrypt)
    user.password = password;
    // Invalidate token immediately to prevent token reuse
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({
      message: 'Password has been successfully reset. You can now sign in with your new password.',
    });
  } catch (err) {
    return sendServerError(res, 'Reset password failed', err, 'Unable to reset password');
  }
});

// @route  GET /api/auth/me
// @desc   Get current user
// @access Private
router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

module.exports = router;
