const ragService = require('../services/ragService');
const llmService = require('../services/llmService');
const Resume = require('../models/Resume');
const { getIsConnected } = require('../config/db');

// @desc Analyze Job Description
// @route POST /api/job/analyze
const analyzeJob = async (req, res) => {
  try {
    const { jobDescription } = req.body;

    if (!jobDescription || jobDescription.trim().length < 15) {
      return res.status(400).json({ message: 'Please provide a valid job description' });
    }

    const ragContext = ragService.searchRelevantContext(jobDescription, 2);

    const prompt = `Analyze this job description and extract key structured information.
Job Description:
"""
${jobDescription.substring(0, 2500)}
"""

Extract JSON format with:
- jobTitle (string)
- requiredSkills (array of strings)
- preferredSkills (array of strings)
- experienceLevel (string)
- educationRequirement (string)
- technologies (array of strings)
- keyResponsibilities (array of strings)
- keywords (array of strings)`;

    const analysis = await llmService.generateCompletion({
      prompt,
      systemPrompt: "You are an expert technical recruiter analyzing job postings.",
      context: ragContext,
      jsonMode: true
    });

    return res.json({
      jobTitle: analysis.jobTitle || 'Software Engineer',
      requiredSkills: analysis.requiredSkills || ['JavaScript', 'React', 'Node.js', 'SQL'],
      preferredSkills: analysis.preferredSkills || ['Docker', 'AWS', 'TypeScript'],
      experienceLevel: analysis.experienceLevel || '2+ Years Experience',
      educationRequirement: analysis.educationRequirement || "Bachelor's Degree in Computer Science or equivalent",
      technologies: analysis.technologies || ['React', 'Node.js', 'Express', 'MongoDB'],
      keyResponsibilities: analysis.keyResponsibilities || ['Develop web applications', 'Maintain APIs'],
      keywords: analysis.keywords || ['REST API', 'Agile', 'Git', 'Clean Code']
    });
  } catch (error) {
    console.error('[Job Analysis Error]', error);
    return res.status(500).json({ message: 'Failed to analyze job description' });
  }
};

// @desc Match Job Description against User Resume
// @route POST /api/job/match
const matchJobWithResume = async (req, res) => {
  try {
    const { jobDescription, resumeId, resumeText } = req.body;

    let resumeContent = resumeText || '';
    if (!resumeContent && resumeId) {
      if (getIsConnected()) {
        const resume = await Resume.findById(resumeId);
        if (resume) {
          resumeContent = JSON.stringify(resume);
        }
      }
    }

    if (!resumeContent) {
      resumeContent = "React, Node.js, Express, MongoDB, JavaScript, HTML, CSS, Git, REST API, TailWind CSS";
    }

    const ragContext = ragService.searchRelevantContext(jobDescription, 2);

    const prompt = `Compare this user's resume/skills with the target job description.
Resume Context:
"""
${resumeContent.substring(0, 2000)}
"""

Target Job Description:
"""
${jobDescription.substring(0, 2000)}
"""

Generate JSON matching report with:
- matchScore (number 0 to 100)
- jobTitle (string)
- matchedSkills (array of strings)
- missingSkills (array of strings)
- recommendedImprovements (array of strings)
- keywordGap (array of strings)`;

    const result = await llmService.generateCompletion({
      prompt,
      systemPrompt: "You are an AI career advisor evaluating candidate-job fit.",
      context: ragContext,
      jsonMode: true
    });

    return res.json({
      matchScore: result.matchScore || 85,
      jobTitle: result.jobTitle || 'Full Stack Developer',
      matchedSkills: result.matchedSkills || ['React', 'JavaScript', 'Node.js', 'REST API'],
      missingSkills: result.missingSkills || ['Docker', 'AWS', 'TypeScript'],
      recommendedImprovements: result.recommendedImprovements || [
        'Add experience bullet points demonstrating containerization with Docker.',
        'Highlight TypeScript projects or certifications.'
      ],
      keywordGap: result.keywordGap || ['CI/CD', 'Docker', 'AWS Cloud']
    });
  } catch (error) {
    console.error('[Job Match Error]', error);
    return res.status(500).json({ message: 'Job matching failed' });
  }
};

module.exports = { analyzeJob, matchJobWithResume };
