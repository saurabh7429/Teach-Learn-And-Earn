const express         = require('express');
const router          = express.Router();
const LearningRequest = require('../models/LearningRequest');
const Chat            = require('../models/Chat');
const { protect }     = require('../middleware/auth');
const { sendServerError } = require('../utils/sendServerError');


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
    return sendServerError(res, 'Request creation failed', err, 'Unable to create request');
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
    return sendServerError(res, 'My requests lookup failed', err, 'Unable to load requests');
  }
});

// @route  GET /api/requests/teaching
// @desc   Get all open requests available for this teacher to offer on
// @access Private
router.get('/teaching', protect, async (req, res) => {
  try {
    // Return ALL open requests that are not the logged-in user's own request
    const requests = await LearningRequest.find({
      status: 'open',
      student: { $ne: req.user._id },
    })
      .populate('student', 'name username')
      .sort('-createdAt');
    res.json(requests);
  } catch (err) {
    return sendServerError(res, 'Teaching feed lookup failed', err, 'Unable to load teaching feed');
  }
});

// @route  GET /api/requests/by-skill/:skill
// @desc   Get both active students and open requests for a specific skill
// @access Private
router.get('/by-skill/:skill', protect, async (req, res) => {
  try {
    const skillQuery = new RegExp(req.params.skill, 'i');

    // 1. Active students assigned to this teacher for this skill
    const activeRequests = await LearningRequest.find({
      selectedTeacher: req.user._id,
      status: { $in: ['selected', 'active'] },
      $or: [{ skill: skillQuery }, { question: skillQuery }],
    })
      .populate('student', 'name username')
      .sort('-updatedAt');

    const reqIds = activeRequests.map((r) => r._id);
    const chats = await Chat.find({
      request: { $in: reqIds },
      participants: req.user._id,
    });

    const activeStudents = activeRequests.map((r) => {
      const c = chats.find(
        (chat) => chat.request && chat.request.toString() === r._id.toString()
      );
      return {
        ...r.toObject(),
        chatId: c ? c._id : null,
      };
    });

    // 2. Open requests seeking a teacher
    const openRequests = await LearningRequest.find({
      status: 'open',
      student: { $ne: req.user._id },
      $or: [{ skill: skillQuery }, { question: skillQuery }],
    })
      .populate('student', 'name username')
      .sort('-createdAt');

    res.json({
      activeStudents,
      openRequests,
    });
  } catch (err) {
    return sendServerError(res, 'Requests by skill lookup failed', err, 'Unable to load requests for that skill');
  }
});

// @route  DELETE /api/requests/clear-all
// @desc   Delete ALL learning requests + their chats (for cleanup)
// @access Private — ADMIN/DEV USE
router.delete('/clear-all', protect, async (req, res) => {
  try {
    await LearningRequest.deleteMany({});
    await require('../models/Chat').deleteMany({});
    res.json({ message: 'All requests and chats cleared.' });
  } catch (err) {
    return sendServerError(res, 'Clear all requests failed', err, 'Unable to clear requests');
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
    return sendServerError(res, 'Offer creation failed', err, 'Unable to submit offer');
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

    const populated = await LearningRequest.findById(request._id)
      .populate('student', 'name username')
      .populate('teacherResponses.teacher', 'name username')
      .populate('selectedTeacher', 'name username');

    res.json(populated);
  } catch (err) {
    return sendServerError(res, 'Teacher selection failed', err, 'Unable to select teacher');
  }
});

module.exports = router;
