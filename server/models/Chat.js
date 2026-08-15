const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  sentAt:  { type: Date, default: Date.now },
});

const chatSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    skill:        { type: String, default: '' },
    skillRef:     { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', default: null },
    request:      { type: mongoose.Schema.Types.ObjectId, ref: 'LearningRequest', default: null },
    messages:     [messageSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Chat', chatSchema);
