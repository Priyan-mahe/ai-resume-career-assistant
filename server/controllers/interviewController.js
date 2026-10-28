const ragService = require('../services/ragService');
const llmService = require('../services/llmService');

// @desc Generate Interview Questions
// @route POST /api/interview/questions
const generateInterviewQuestions = async (req, res) => {
  try {
    const { role = 'Full Stack Developer', experience = 'Mid Level', technology = 'React & Node.js', difficulty = 'Medium' } = req.body;

    const ragQuery = `Interview questions for ${role} ${technology} ${experience}`;
    const ragContext = ragService.searchRelevantContext(ragQuery, 3);

    const prompt = `Generate a realistic interview question set for candidate:
Target Role: ${role}
Experience: ${experience}
Tech Stack: ${technology}
Difficulty: ${difficulty}

Provide JSON output:
{
  "role": "${role}",
  "totalQuestions": 5,
  "questions": [
    {
      "id": 1,
      "category": "Technical",
      "question": "How does Node.js event loop handle asynchronous I/O?",
      "expectedAnswer": "Explain call stack, libuv thread pool, microtasks, and macrotasks.",
      "hints": ["Focus on non-blocking I/O and libuv thread pool."]
    },
    {
      "id": 2,
      "category": "HR",
      "question": "Describe how you prioritize conflicting feature deadlines.",
      "expectedAnswer": "Communicate with stakeholders, analyze MVP impact, and estimate effort.",
      "hints": ["Use STAR framework."]
    },
    {
      "id": 3,
      "category": "Coding / System Design",
      "question": "Design an online rate limiter service for REST API endpoints.",
      "expectedAnswer": "Token Bucket or Leaky Bucket algorithm using Redis memory counters.",
      "hints": ["Think about distributed locks and atomic operations."]
    },
    {
      "id": 4,
      "category": "Behavioral",
      "question": "Tell me about a technical disagreement you had with a team member and how you resolved it.",
      "expectedAnswer": "Focus on data-driven benchmarking and respectful communication.",
      "hints": ["State the outcome clearly."]
    },
    {
      "id": 5,
      "category": "Scenario",
      "question": "Your production database CPU utilization hits 99% during peak sale hours. What step-by-step actions do you take?",
      "expectedAnswer": "Check slow query logs, enable read replicas, add Redis caching, kill runaway queries.",
      "hints": ["Immediate mitigation first, root cause analysis second."]
    }
  ]
}`;

    const questionsData = await llmService.generateCompletion({
      prompt,
      systemPrompt: "You are a senior hiring manager and tech interviewer.",
      context: ragContext,
      jsonMode: true
    });

    return res.json(questionsData);
  } catch (error) {
    console.error('[Interview Questions Error]', error);
    return res.status(500).json({ message: 'Failed to generate interview questions' });
  }
};

// @desc Evaluate User Interview Answer
// @route POST /api/interview/evaluate
const evaluateInterviewAnswer = async (req, res) => {
  try {
    const { question, userAnswer, expectedAnswer, role = 'Software Engineer' } = req.body;

    if (!userAnswer || userAnswer.trim().length === 0) {
      return res.status(400).json({ message: 'Please provide your answer to evaluate' });
    }

    const prompt = `Evaluate candidate's interview answer:
Question: "${question}"
Expected Guidance: "${expectedAnswer || 'Clear technical explanation with examples'}"

Candidate Answer:
"""
${userAnswer}
"""

Provide JSON output with evaluation metrics:
{
  "overallScore": 85,
  "technicalScore": 88,
  "communicationScore": 82,
  "confidenceScore": 85,
  "feedback": "Strong explanation of core concepts with good technical vocabulary.",
  "strengths": ["Accurate terminology", "Clear logical flow"],
  "areasToImprove": ["Add a real-world project example", "Mention trade-offs"],
  "modelAnswer": "Comprehensive exemplary answer..."
}`;

    const evaluation = await llmService.generateCompletion({
      prompt,
      systemPrompt: "You are an AI Interviewer evaluating candidates with constructive feedback.",
      jsonMode: true
    });

    return res.json(evaluation);
  } catch (error) {
    console.error('[Interview Evaluation Error]', error);
    return res.status(500).json({ message: 'Interview answer evaluation failed' });
  }
};

module.exports = { generateInterviewQuestions, evaluateInterviewAnswer };
