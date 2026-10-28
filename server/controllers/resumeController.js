const Resume = require('../models/Resume');
const { getIsConnected } = require('../config/db');
const atsService = require('../services/atsService');
const llmService = require('../services/llmService');
const pdfService = require('../services/pdfService');

// In-memory fallback resumes store
const memoryResumes = [];

// Seed an initial demo resume if empty
const getDefaultDemoResume = (userOrId) => {
  const userId = typeof userOrId === 'object' ? userOrId?._id : userOrId;
  const fullName = typeof userOrId === 'object' ? (userOrId?.name || '') : '';
  const email = typeof userOrId === 'object' ? (userOrId?.email || '') : '';

  return {
    _id: 'resume_demo_1',
    userId: userId || 'user_demo_123',
    title: fullName ? `${fullName}'s Resume` : 'Full Stack Software Engineer Resume',
    personalInfo: {
      fullName: fullName || '',
      email: email || '',
      phone: '',
      location: '',
      linkedin: '',
      github: '',
      portfolio: '',
    },
  summary: 'Results-driven Full Stack Engineer with 3+ years of experience developing high-performance MERN web applications, REST APIs, and modern cloud architectures.',
  education: [
    {
      degree: 'B.S. in Computer Science',
      college: 'University of California, Berkeley',
      location: 'Berkeley, CA',
      startYear: '2019',
      endYear: '2023',
      cgpa: '3.8 / 4.0',
    }
  ],
  skills: {
    languages: ['JavaScript', 'TypeScript', 'Python', 'SQL', 'HTML/CSS'],
    frameworks: ['React.js', 'Node.js', 'Express.js', 'Tailwind CSS', 'Next.js'],
    databases: ['MongoDB', 'PostgreSQL', 'Redis'],
    tools: ['Git', 'Docker', 'AWS', 'Vite', 'Postman', 'Jest'],
    softSkills: ['Problem Solving', 'Team Collaboration', 'Agile/Scrum', 'Technical Writing'],
  },
  experience: [
    {
      company: 'TechPulse Solutions',
      role: 'Full Stack Developer',
      location: 'San Francisco, CA',
      startDate: '2023-06',
      endDate: 'Present',
      responsibilities: [
        'Engineered responsive React UI components reducing client page load times by 40%.',
        'Built secure Node.js REST API microservices handling over 50,000 daily API requests.',
        'Optimized MongoDB indexes and query execution, cutting database response latency by 35%.'
      ],
    }
  ],
  projects: [
    {
      name: 'AI Resume & Career Assistant',
      description: 'Full-stack platform integrating LLM, RAG, and CAG for ATS scoring and personalized career roadmaps.',
      technologies: ['React', 'Node.js', 'MongoDB', 'Tailwind', 'RAG'],
      github: '',
      liveDemo: '',
    }
  ],
  certifications: [
    {
      name: 'AWS Certified Developer - Associate',
      organization: 'Amazon Web Services',
      date: '2023',
      credentialUrl: '',
    }
  ],
  template: 'modern',
  atsScore: 88,
  createdAt: new Date(),
  updatedAt: new Date(),
  };
};

const findResumeByIdOrUser = async (resumeId, userId) => {
  if (getIsConnected()) {
    try {
      if (resumeId) {
        const found = await Resume.findById(resumeId);
        if (found) return found;
      }
      if (userId) {
        const found = await Resume.findOne({ userId }).sort({ updatedAt: -1 });
        if (found) return found;
      }
    } catch (e) {}
  }
  return null;
};

// @desc Create a new resume
// @route POST /api/resumes
const createResume = async (req, res) => {
  try {
    if (!getIsConnected()) {
      return res.status(503).json({
        error: 'Database Unavailable',
        message: 'MongoDB is disconnected. Cannot save resume. Please configure MONGODB_URI in server/.env.'
      });
    }

    const userId = req.user._id;
    const resumeData = { ...req.body, userId };
    const resume = await Resume.create(resumeData);
    return res.status(201).json(resume);
  } catch (error) {
    console.error('[Create Resume Error]', error);
    return res.status(500).json({ message: 'Failed to create resume: ' + error.message });
  }
};

// @desc Get all user resumes
// @route GET /api/resumes
const getResumes = async (req, res) => {
  try {
    if (!getIsConnected()) {
      return res.status(503).json({
        error: 'Database Unavailable',
        message: 'MongoDB is disconnected. Cannot fetch resumes. Please configure MONGODB_URI in server/.env.'
      });
    }

    const userId = req.user._id;
    let resumes = await Resume.find({ userId }).sort({ updatedAt: -1 });
    if (resumes.length === 0) {
      // Seed default resume if user has none
      const seeded = await Resume.create(getDefaultDemoResume(req.user));
      resumes = [seeded];
    }
    return res.json(resumes);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching resumes: ' + error.message });
  }
};

// @desc Get single resume by ID
// @route GET /api/resumes/:id
const getResumeById = async (req, res) => {
  try {
    if (!getIsConnected()) {
      return res.status(503).json({
        error: 'Database Unavailable',
        message: 'MongoDB is disconnected. Please configure MONGODB_URI in server/.env.'
      });
    }

    const { id } = req.params;
    const resume = await Resume.findOne({ _id: id, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found or unauthorized' });
    }
    return res.json(resume);
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving resume: ' + error.message });
  }
};

// @desc Update resume
// @route PUT /api/resumes/:id
const updateResume = async (req, res) => {
  try {
    if (!getIsConnected()) {
      return res.status(503).json({
        error: 'Database Unavailable',
        message: 'MongoDB is disconnected. Cannot update resume. Please configure MONGODB_URI in server/.env.'
      });
    }

    const { id } = req.params;
    const updated = await Resume.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Resume not found or unauthorized' });
    }
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update resume: ' + error.message });
  }
};

// @desc Delete resume
// @route DELETE /api/resumes/:id
const deleteResume = async (req, res) => {
  try {
    if (!getIsConnected()) {
      return res.status(503).json({
        error: 'Database Unavailable',
        message: 'MongoDB is disconnected. Cannot delete resume.'
      });
    }

    const { id } = req.params;
    const deleted = await Resume.findOneAndDelete({ _id: id, userId: req.user._id });
    if (!deleted) {
      return res.status(404).json({ message: 'Resume not found or unauthorized' });
    }
    return res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete resume: ' + error.message });
  }
};

// @desc Analyze Resume ATS score
// @route POST /api/resumes/:id/ats
const analyzeResumeATS = async (req, res) => {
  try {
    const { id } = req.params;
    const { jobDescription } = req.body;

    let resumeObj = null;
    if (getIsConnected()) {
      resumeObj = await Resume.findById(id);
    }

    const analysis = await atsService.analyzeResume({
      resumeData: resumeObj || req.body,
      jobDescription: jobDescription || ''
    });

    if (resumeObj) {
      resumeObj.atsScore = analysis.score;
      resumeObj.atsAnalysis = { ...analysis, lastAnalyzedAt: new Date() };
      await resumeObj.save();
    }

    return res.json({
      resumeId: id,
      atsScore: analysis.score,
      analysis
    });
  } catch (error) {
    console.error('[ATS Analysis Error]', error);
    return res.status(500).json({ message: 'ATS analysis failed: ' + error.message });
  }
};

// @desc Upload PDF & Analyze ATS
// @route POST /api/resumes/upload-analyze
const uploadAndAnalyzeResume = async (req, res) => {
  try {
    const jobDescription = req.body.jobDescription || '';
    let extractedText = '';

    if (req.file) {
      extractedText = await pdfService.extractText(req.file.buffer);
    } else if (req.body.resumeText) {
      extractedText = req.body.resumeText;
    } else {
      return res.status(400).json({ message: 'Please upload a PDF file or provide resume text' });
    }

    const analysis = await atsService.analyzeResume({
      resumeText: extractedText,
      jobDescription
    });

    return res.json({
      extractedTextSnippet: extractedText.substring(0, 300) + '...',
      atsScore: analysis.score,
      analysis
    });
  } catch (error) {
    console.error('[Upload & Analyze Error]', error);
    return res.status(500).json({ message: 'Failed to parse and analyze file' });
  }
};

// @desc Generate AI Summary for Resume
// @route POST /api/resumes/:id/summary
const generateAISummary = async (req, res) => {
  try {
    const { skills, targetRole, experienceLevel } = req.body;
    const prompt = `Generate a compelling, 3-sentence professional summary for a ${targetRole || 'Software Engineer'} with skills: ${(skills || []).join(', ')}. Focus on value delivery and quantitative achievements.`;

    const summary = await llmService.generateCompletion({
      prompt,
      systemPrompt: "You are an expert executive resume writer.",
    });

    return res.json({ summary: typeof summary === 'string' ? summary : summary.summary || summary });
  } catch (error) {
    return res.status(500).json({ message: 'AI summary generation failed' });
  }
};

// @desc Improve experience bullet points with AI
// @route POST /api/resumes/improve-experience
const improveExperienceBullets = async (req, res) => {
  try {
    const { role, company, responsibility } = req.body;
    const prompt = `Rewrite and improve the following work experience bullet point for a ${role} at ${company}. Make it action-oriented, start with a strong past-tense verb, and include quantifiable impact metrics:
"""
${responsibility}
"""`;

    const result = await llmService.generateCompletion({
      prompt,
      systemPrompt: "You are an expert resume editor who follows the Google XYZ formula (Accomplished X, measured by Y, doing Z).",
      jsonMode: true
    });

    return res.json({
      improvedBullets: Array.isArray(result?.bulletPoints) ? result.bulletPoints : [typeof result === 'string' ? result : responsibility]
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to improve experience bullets' });
  }
};

module.exports = {
  createResume,
  getResumes,
  getResumeById,
  updateResume,
  deleteResume,
  analyzeResumeATS,
  uploadAndAnalyzeResume,
  generateAISummary,
  improveExperienceBullets,
  findResumeByIdOrUser,
  memoryResumes
};
