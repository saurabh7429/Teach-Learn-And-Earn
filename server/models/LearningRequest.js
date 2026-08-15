const mongoose = require('mongoose');

const learningRequestSchema = new mongoose.Schema(
  {
    question:    { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    skill:       { type: String, default: '' },       // Optional skill/technology tag
    student:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Teachers who offered to teach
    teacherResponses: [
      {
        teacher:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        offeredAt: { type: Date, default: Date.now },
      },
    ],

    // Status flow: open → selected → active → closed
    status: {
      type: String,
      enum: ['open', 'selected', 'active', 'closed'],
      default: 'open',
    },

    selectedTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LearningRequest', learningRequestSchema);
