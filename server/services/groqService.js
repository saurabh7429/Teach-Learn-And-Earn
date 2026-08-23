const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'openai/gpt-oss-120b';
const FALLBACK_MODEL = 'openai/gpt-oss-20b';

/**
 * Send request to Groq API with automatic fallback
 */
async function callGroqAPI(messages, temperature = 0.5, maxTokens = 600, jsonMode = false) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured in server environment');
  }

  const payload = {
    model: DEFAULT_MODEL,
    messages,
    temperature,
    max_tokens: maxTokens,
  };

  if (jsonMode) {
    payload.response_format = { type: 'json_object' };
  }

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      // Try fallback model if rate limit or model issue
      console.warn(`Groq primary model failed (${response.status}), retrying with fallback model...`);
      payload.model = FALLBACK_MODEL;
      const fallbackResponse = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!fallbackResponse.ok) {
        const errText = await fallbackResponse.text();
        throw new Error(`Groq API Error (${fallbackResponse.status}): ${errText}`);
      }

      const data = await fallbackResponse.json();
      return data.choices[0]?.message?.content || '';
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Groq Service Error:', error.message);
    throw error;
  }
}

/**
 * Ask Teach Devta AI tutor a learning question
 */
async function askTeachDevta(question, context = '') {
  const systemPrompt = `You are "Teach Devta", an intelligent, empathetic, and encouraging AI tutor on the Teach, Learn & Earn (TL&E) platform.
Your goal is to provide concise, high-value, step-by-step explanations.
Formatting guidelines:
- Use clean Markdown formatting with clear bullet points.
- Include short, concrete code or real-world examples when applicable.
- Keep the response tight and directly actionable (max 200 words) to save tokens.
- Maintain an encouraging mentor tone.`;

  const userContent = context 
    ? `Context / Skill: ${context}\n\nStudent Question: ${question}`
    : `Student Question: ${question}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent },
  ];

  return await callGroqAPI(messages, 0.4, 500);
}

/**
 * Generate 3 dynamic assessment questions for teacher skill verification
 */
async function generateSkillQuiz(skillName, skillDescription = '') {
  const systemPrompt = `You are the Teach Devta Skill Verification Examiner.
Generate exactly 3 multiple-choice assessment questions to evaluate if a teacher genuinely knows the topic "${skillName}".
Return ONLY a valid JSON object matching this schema:
{
  "skill": "${skillName}",
  "questions": [
    {
      "id": 1,
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Brief explanation why option A is correct"
    },
    {
      "id": 2,
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 1,
      "explanation": "Brief explanation"
    },
    {
      "id": 3,
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 2,
      "explanation": "Brief explanation"
    }
  ]
}
Make questions practical, testing real knowledge rather than trivial trivia.`;

  const userContent = `Skill: ${skillName}\nDescription: ${skillDescription || 'General proficiency'}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent },
  ];

  try {
    const rawJson = await callGroqAPI(messages, 0.2, 700, true);
    return JSON.parse(rawJson);
  } catch (err) {
    console.warn('Falling back to default quiz generator for skill:', skillName);
    // Robust structured fallback if AI parsing fails
    return {
      skill: skillName,
      questions: [
        {
          id: 1,
          question: `What is the foundational architectural concept in ${skillName}?`,
          options: [
            'Modularity and separation of concerns',
            'Monolithic single-file architecture',
            'Ignoring error boundary handling',
            'Hardcoding dynamic credentials'
          ],
          correctIndex: 0,
          explanation: 'Modularity and clean separation of concerns enable maintainable, scalable systems.'
        },
        {
          id: 2,
          question: `When explaining ${skillName} to beginners, what is the most effective approach?`,
          options: [
            'Abstract mathematical jargon without examples',
            'Real-world analogies paired with interactive code demonstrations',
            'Skipping setup and jumping straight to edge cases',
            'Discouraging question asking'
          ],
          correctIndex: 1,
          explanation: 'Real-world analogies and practical exercises accelerate beginner comprehension.'
        },
        {
          id: 3,
          question: `How do you best handle performance optimization and error handling in ${skillName}?`,
          options: [
            'Suppressing all exceptions with empty catch blocks',
            'Polling every millisecond recursively',
            'Using proactive validation, structured error logging, and efficient caching/async patterns',
            'Relying solely on client browser memory'
          ],
          correctIndex: 2,
          explanation: 'Structured logging, async patterns, and proactive validation ensure robust reliability.'
        }
      ]
    };
  }
}

module.exports = {
  callGroqAPI,
  askTeachDevta,
  generateSkillQuiz,
};
