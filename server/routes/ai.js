const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const { askTeachDevta, generateSkillQuiz, enhanceLearningRequest } = require('../services/groqService');
const { sendServerError } = require('../utils/sendServerError');

// @route   POST /api/ai/ask
// @desc    Ask Teach Devta — requires login
// @access  Private
router.post('/ask', protect, async (req, res) => {
  try {
    const { question, context } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ message: 'Question text is required' });
    }

    const answer = await askTeachDevta(question.trim(), context);
    res.json({ answer });
  } catch (error) {
    console.error('AI Ask error:', error);
    res.status(500).json({
      message: 'Failed to process question',
      fallbackAnswer: 'Teach Devta is currently busy. Please try again shortly!',
    });
  }
});

// @route   POST /api/ai/enhance-request
// @desc    AI-refine a student's learning request text
// @access  Private
router.post('/enhance-request', protect, async (req, res) => {
  try {
    const { question, description, skill } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ message: 'Question is required' });
    }

    const enhanced = await enhanceLearningRequest(question.trim(), description || '', skill || '');
    res.json(enhanced);
  } catch (error) {
    console.error('Enhance request error:', error);
    res.status(500).json({ message: 'Enhancement failed. Please try again.' });
  }
});

// @route   POST /api/ai/generate-quiz
// @desc    Generate dynamic skill-verification quiz
// @access  Private
router.post('/generate-quiz', protect, async (req, res) => {
  try {
    const { skillName, skillDescription } = req.body;
    if (!skillName || !skillName.trim()) {
      return res.status(400).json({ message: 'Skill name is required' });
    }

    const quiz = await generateSkillQuiz(skillName.trim(), skillDescription);
    res.json(quiz);
  } catch (error) {
    return sendServerError(res, 'Quiz generation failed', error, 'Failed to generate quiz');
  }
});

module.exports = router;
