const express         = require('express');
const router          = express.Router();
const LearningRequest = require('../models/LearningRequest');
const Skill           = require('../models/Skill');
const Chat            = require('../models/Chat');
const { protect }     = require('../middleware/auth');

// @route  POST /api/requests
// @desc   Create a learning request (student)
// @access Private
router.post('/', protect, async (req, res) => {
  try {
    const { question, description, skill } = req.body;
    if (!question) return res.status(400).json({ message: 'Question is required' });

    const request = await LearningRequest.create({
      question,
      description: description || '',
      skill:       skill || '',
      student:     req.user._id,
    });

    const populated = await request.populate('student', 'name username');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route  GET /api/requests/my
// @desc   Get my learning requests (as student)
// @access Private
router.get('/my', protect, async (req, res) => {
  try {
    const requests = await LearningRequest.find({ student: req.user._id })
      .populate('student', 'name username')
      .populate('teacherResponses.teacher', 'name username')
      .populate('selectedTeacher', 'name username')
      .sort('-createdAt');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route  GET /api/requests/teaching
// @desc   Get open requests matching my verified skills (as teacher)
// @access Private
router.get('/teaching', protect, async (req, res) => {
  try {
    // Get my verified skills
    const mySkills = await Skill.find({ teacher: req.user._id, verified: true }).select('name');
    const skillNames = mySkills.map((s) => s.name.toLowerCase());

    // Return all open requests that match my skills (or all open if no skills yet)
    let query = { status: 'open', student: { $ne: req.user._id } };
    if (skillNames.length > 0) {
      query.skill = {
        $in: skillNames.map((n) => new RegExp(n, 'i')),
      };
    }

    const requests = await LearningRequest.find(query)
      .populate('student', 'name username')
      .sort('-createdAt');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route  POST /api/requests/:id/offer
// @desc   Teacher offers to teach a request
// @access Private
router.post('/:id/offer', protect, async (req, res) => {
  try {
    const request = await LearningRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'open')
      return res.status(400).json({ message: 'Request is no longer open' });
    if (request.student.toString() === req.user._id.toString())
      return res.status(400).json({ message: 'You cannot offer to teach your own request' });

    // Prevent duplicate offers
    const alreadyOffered = request.teacherResponses.some(
      (r) => r.teacher.toString() === req.user._id.toString()
    );
    if (alreadyOffered)
      return res.status(400).json({ message: 'You already offered to teach this request' });

    request.teacherResponses.push({ teacher: req.user._id });
    await request.save();

    const populated = await request.populate('teacherResponses.teacher', 'name username');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route  POST /api/requests/:id/select
// @desc   Student selects a teacher from offers
// @access Private
router.post('/:id/select', protect, async (req, res) => {
  try {
    const { teacherId } = req.body;
    if (!teacherId) return res.status(400).json({ message: 'teacherId is required' });

    const request = await LearningRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.student.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Only the student can select a teacher' });

    // Check if teacherId matches either the teacher User ID or subdocument _id
    const responseItem = request.teacherResponses.find(
      (r) =>
        (r.teacher && r.teacher.toString() === teacherId.toString()) ||
        (r._id && r._id.toString() === teacherId.toString())
    );

    if (!responseItem) {
      return res.status(400).json({ message: 'Teacher has not offered for this request' });
    }

    const actualTeacherId = responseItem.teacher;
    request.selectedTeacher = actualTeacherId;
    request.status = 'selected';
    await request.save();

    // Create a chat between student and selected teacher
    const existingChat = await Chat.findOne({
      participants: { $all: [req.user._id, actualTeacherId] },
      request: request._id,
    });

    if (!existingChat) {
      await Chat.create({
        participants: [req.user._id, actualTeacherId],
        skill:        request.skill || 'Learning Session',
        request:      request._id,
        messages:     [],
      });
    }

    const populated = await request
      .populate('student', 'name username')
      .populate('teacherResponses.teacher', 'name username')
      .populate('selectedTeacher', 'name username');

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
