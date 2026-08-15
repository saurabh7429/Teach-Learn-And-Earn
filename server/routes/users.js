const express = require('express');
const router  = express.Router();
const User    = require('../models/User');
const { protect } = require('../middleware/auth');

// @route  GET /api/users/:id
// @desc   Get public user profile
// @access Private
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route  PUT /api/users/profile
// @desc   Update own profile
// @access Private
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name   = req.body.name   || user.name;
    user.avatar = req.body.avatar || user.avatar;

    const updated = await user.save();
    res.json({ _id: updated._id, name: updated.name, username: updated.username, email: updated.email });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
