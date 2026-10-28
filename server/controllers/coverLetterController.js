const CoverLetter = require('../models/CoverLetter');
const { getIsConnected } = require('../config/db');
const ragService = require('../services/ragService');
const llmService = require('../services/llmService');

// @desc Generate AI Cover Letter
// @route POST /api/cover-letter/generate
const generateCoverLetter = async (req, res) => {
  try {
    if (!getIsConnected()) {
      return res.status(503).json({
        error: 'Database Unavailable',
        message: 'MongoDB is disconnected. Cannot save generated cover letter. Please configure MONGODB_URI in server/.env.'
      });
    }

    const { jobTitle, company, jobDescription, resumeText, tone = 'Professional' } = req.body;
    const userId = req.user._id;

    if (!jobTitle || !company) {
      return res.status(400).json({ message: 'Please specify job title and company name' });
    }

    const ragQuery = `Cover letter best practices for ${jobTitle} at ${company}`;
    const ragContext = ragService.searchRelevantContext(ragQuery, 2);

    const prompt = `Generate a compelling, highly personalized cover letter in a ${tone} tone.
Candidate Resume Context:
"""
${(resumeText || 'Full Stack Engineer with React, Node.js, and MongoDB experience. Built scalable web apps.').substring(0, 1500)}
"""

Target Position: ${jobTitle}
Company Name: ${company}
Job Description:
"""
${(jobDescription || '').substring(0, 1500)}
"""

Instructions:
1. Include formal header placeholders.
2. Direct, engaging opening paragraph mentioning ${jobTitle} at ${company}.
3. 2 body paragraphs connecting candidate experience directly to job requirements.
4. Strong closing call-to-action.`;

    const generatedText = await llmService.generateCompletion({
      prompt,
      systemPrompt: "You are an expert career consultant and professional resume/cover letter writer.",
      context: ragContext
    });

    const letterContent = typeof generatedText === 'string' ? generatedText : generatedText.coverLetter || generatedText;

    const savedRecord = await CoverLetter.create({
      userId,
      jobTitle,
      company,
      jobDescription: jobDescription || '',
      tone,
      content: letterContent
    });

    return res.status(201).json(savedRecord);
  } catch (error) {
    console.error('[Cover Letter Error]', error);
    return res.status(500).json({ message: 'Failed to generate cover letter: ' + error.message });
  }
};

// @desc Get user cover letters
// @route GET /api/cover-letter
const getCoverLetters = async (req, res) => {
  try {
    if (!getIsConnected()) {
      return res.status(503).json({
        error: 'Database Unavailable',
        message: 'MongoDB is disconnected. Please configure MONGODB_URI in server/.env.'
      });
    }

    const userId = req.user._id;
    const letters = await CoverLetter.find({ userId }).sort({ createdAt: -1 });
    return res.json(letters);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching cover letters: ' + error.message });
  }
};

module.exports = { generateCoverLetter, getCoverLetters };
