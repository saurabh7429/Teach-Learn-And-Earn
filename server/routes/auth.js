const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const { protect } = require('../middleware/auth');

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
    res.status(500).json({ message: err.message });
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
    res.status(500).json({ message: err.message });
  }
});

// @route  GET /api/auth/me
// @desc   Get current user
// @access Private
router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

module.exports = router;
