const express = require('express');
const router  = express.Router();
const Skill   = require('../models/Skill');
const { protect } = require('../middleware/auth');
const { sendServerError } = require('../utils/sendServerError');

// @route  GET /api/skills
// @desc   Get all skills
// @access Private
router.get('/', protect, async (req, res) => {
  try {
    const skills = await Skill.find().populate('teacher', 'name username').sort('-createdAt');
    res.json(skills);
  } catch (err) {
    return sendServerError(res, 'Skills list failed', err, 'Unable to load skills');
  }
});

// @route  GET /api/skills/mine
// @desc   Get my teaching skills
// @access Private
router.get('/mine', protect, async (req, res) => {
  try {
    const skills = await Skill.find({ teacher: req.user._id })
      .populate('students', 'name username')
      .sort('-createdAt');
    res.json(skills);
  } catch (err) {
    return sendServerError(res, 'My skills lookup failed', err, 'Unable to load your skills');
  }
});

// @route  POST /api/skills
// @desc   Add a new skill (teacher)
// @access Private
router.post('/', protect, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Skill name is required' });

    const skill = await Skill.create({
      name,
      description: description || '',
      teacher: req.user._id,
      verified: false,
    });

    res.status(201).json(skill);
  } catch (err) {
    return sendServerError(res, 'Skill creation failed', err, 'Unable to add skill');
  }
});

// @route  PUT /api/skills/:id/verify
// @desc   Verify a skill (simulates Teach Devta passing)
// @access Private
router.put('/:id/verify', protect, async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) return res.status(404).json({ message: 'Skill not found' });
    if (skill.teacher.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    skill.verified = true;
    await skill.save();
    res.json(skill);
  } catch (err) {
    return sendServerError(res, 'Skill verification failed', err, 'Unable to verify skill');
  }
});

// @route  DELETE /api/skills/:id
// @desc   Delete a skill
// @access Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) return res.status(404).json({ message: 'Skill not found' });
    if (skill.teacher.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    await skill.deleteOne();
    res.json({ message: 'Skill removed' });
  } catch (err) {
    return sendServerError(res, 'Skill deletion failed', err, 'Unable to remove skill');
  }
});

module.exports = router;
