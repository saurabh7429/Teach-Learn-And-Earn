const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { askTeachDevta, generateSkillQuiz } = require('../services/groqService');

// @route   POST /api/ai/ask
// @desc    Ask Teach Devta AI a question (optional auth)
// @access  Public / Authenticated
router.post('/ask', async (req, res) => {
  try {
    const { question, context } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ message: 'Question text is required' });
    }

    const answer = await askTeachDevta(question.trim(), context);
    res.json({ answer, source: 'groq-llama-3.3' });
  } catch (error) {
    console.error('AI Ask error:', error.message);
    res.status(500).json({ 
      message: 'Failed to process AI question', 
      error: error.message,
      fallbackAnswer: 'Teach Devta AI is currently processing high traffic. Connect directly with peer teachers on TL&E for 1-on-1 assistance!'
    });
  }
});

// @route   POST /api/ai/generate-quiz
// @desc    Generate dynamic 3-question verification quiz for a skill
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
