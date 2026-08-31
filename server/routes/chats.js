const express     = require('express');
const router      = express.Router();
const Chat        = require('../models/Chat');
const LearningRequest = require('../models/LearningRequest');
const { protect } = require('../middleware/auth');
const { sendServerError } = require('../utils/sendServerError');

// Helper to populate chat
const populateChat = (query) =>
  query
    .populate('participants', 'name username')
    .populate({
      path: 'request',
      select: 'student selectedTeacher question skill status',
      populate: [
        { path: 'student', select: 'name username' },
        { path: 'selectedTeacher', select: 'name username' },
      ],
    })
    .populate('messages.sender', 'name username');

// @route  GET /api/chats
// @desc   Get MY chats only (filtered by logged-in user)
// @access Private
router.get('/', protect, async (req, res) => {
  try {
    const chats = await populateChat(Chat.find({ participants: req.user._id })).sort('-updatedAt');
    res.json(chats);
  } catch (err) {
    return sendServerError(res, 'Chat list failed', err, 'Unable to load chats');
  }
});

// @route  GET /api/chats/:id
// @desc   Get a single chat (only if user is a participant)
// @access Private
router.get('/:id', protect, async (req, res) => {
  try {
    const chat = await populateChat(Chat.findById(req.params.id));
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    const isParticipant = chat.participants.some(
      (p) => p._id.toString() === req.user._id.toString()
    );
    if (!isParticipant) return res.status(403).json({ message: 'Not authorized' });

    res.json(chat);
  } catch (err) {
    return sendServerError(res, 'Chat lookup failed', err, 'Unable to load chat');
  }
});

// @route  POST /api/chats/:id/message
// @desc   Send a message — broadcasts via Socket.IO to room
// @access Private
router.post('/:id/message', protect, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'Message content is required' });

    const chat = await Chat.findById(req.params.id);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    if (chat.status === 'completed')
      return res.status(400).json({ message: 'This session has been marked as complete.' });

    const isParticipant = chat.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );
    if (!isParticipant) return res.status(403).json({ message: 'Not authorized' });

    chat.messages.push({ sender: req.user._id, content });
    await chat.save();

    const updated = await populateChat(Chat.findById(chat._id));

    // Emit the new message to everyone else in this chat room
    const io = req.app.get('io');
    if (io) {
      io.to(chat._id.toString()).emit('new_message', updated);
    }

    res.status(201).json(updated);
  } catch (err) {
    return sendServerError(res, 'Chat message send failed', err, 'Unable to send message');
  }
});

// @route  PATCH /api/chats/:id/complete
// @desc   Mark session as complete
// @access Private
router.patch('/:id/complete', protect, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    const isParticipant = chat.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );
    if (!isParticipant) return res.status(403).json({ message: 'Not authorized' });

    if (chat.status === 'completed')
      return res.status(400).json({ message: 'Session already completed' });

    chat.status = 'completed';
    chat.completedAt = new Date();
    await chat.save();

    // Also close the linked learning request if any
    if (chat.request) {
      await LearningRequest.findByIdAndUpdate(chat.request, { status: 'closed' });
    }

    const updated = await populateChat(Chat.findById(chat._id));

    const io = req.app.get('io');
    if (io) {
      io.to(chat._id.toString()).emit('session_completed', updated);
    }

    res.json(updated);
  } catch (err) {
    return sendServerError(res, 'Chat completion failed', err, 'Unable to complete session');
  }
});

module.exports = router;
