const express     = require('express');
const router      = express.Router();
const Chat        = require('../models/Chat');
const { protect } = require('../middleware/auth');

// @route  GET /api/chats
// @desc   Get all my chats
// @access Private
router.get('/', protect, async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user._id })
      .populate('participants', 'name username')
      .sort('-updatedAt');
    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route  GET /api/chats/:id
// @desc   Get a single chat with messages
// @access Private
router.get('/:id', protect, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate('participants', 'name username')
      .populate('messages.sender', 'name username');

    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    const isParticipant = chat.participants.some(
      (p) => p._id.toString() === req.user._id.toString()
    );
    if (!isParticipant) return res.status(403).json({ message: 'Not authorized' });

    res.json(chat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route  POST /api/chats/:id/message
// @desc   Send a message in a chat
// @access Private
router.post('/:id/message', protect, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'Message content is required' });

    const chat = await Chat.findById(req.params.id);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    const isParticipant = chat.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );
    if (!isParticipant) return res.status(403).json({ message: 'Not authorized' });

    chat.messages.push({ sender: req.user._id, content });
    await chat.save();

    const updated = await Chat.findById(chat._id)
      .populate('participants', 'name username')
      .populate('messages.sender', 'name username');

    res.status(201).json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
