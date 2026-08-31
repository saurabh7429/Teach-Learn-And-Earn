const express         = require('express');
const router          = express.Router();
const Skill           = require('../models/Skill');
const LearningRequest = require('../models/LearningRequest');
const Chat            = require('../models/Chat');
const { protect }     = require('../middleware/auth');
const { sendServerError } = require('../utils/sendServerError');

// @route  GET /api/progress
// @desc   Get combined learning + teaching progress for current user
// @access Private
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Teaching stats
    const mySkills = await Skill.find({ teacher: userId })
      .populate('students', 'name username');

    const totalStudents = mySkills.reduce((sum, s) => sum + s.students.length, 0);

    // Learning stats — requests that are active (teacher selected)
    const activeRequests = await LearningRequest.find({
      student: userId,
      status:  { $in: ['selected', 'active'] },
    }).populate('selectedTeacher', 'name username');

    // Chats
    const myChats = await Chat.find({ participants: userId });

    res.json({
      teaching: {
        skills:        mySkills,
        totalStudents,
        verifiedCount: mySkills.filter((s) => s.verified).length,
      },
      learning: {
        activeRequests,
        skillsLearning: activeRequests.length,
      },
      totalSessions: myChats.reduce((sum, c) => sum + c.messages.length, 0),
    });
  } catch (err) {
    return sendServerError(res, 'Progress lookup failed', err, 'Unable to load progress');
  }
});

module.exports = router;
