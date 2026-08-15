const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    teacher:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    verified:    { type: Boolean, default: false },
    students:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Skill', skillSchema);
