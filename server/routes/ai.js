const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const { askTeachDevta, generateSkillQuiz } = require('../services/groqService');

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
    console.error('AI Ask error:', error.message);
    res.status(500).json({
      message: 'Failed to process question',
      fallbackAnswer: 'Teach Devta is currently busy. Please try again shortly!',
    });
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
    console.error('Quiz Generation error:', error.message);
    res.status(500).json({ message: 'Failed to generate quiz', error: error.message });
  }
});

module.exports = router;
