const express = require('express');
const router  = express.Router();
const User    = require('../models/User');
const { protect } = require('../middleware/auth');
const { sendServerError } = require('../utils/sendServerError');

// @route  GET /api/users/:id
// @desc   Get public user profile
// @access Private
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    return sendServerError(res, 'User lookup failed', err, 'Unable to load user');
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
    return sendServerError(res, 'Profile update failed', err, 'Unable to update profile');
  }
});

module.exports = router;
