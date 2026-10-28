const Portfolio = require('../models/Portfolio');
const Resume = require('../models/Resume');
const { getIsConnected } = require('../config/db');
const { findResumeByIdOrUser } = require('./resumeController');

// Neutral fallback portfolio generator without fake personal details
const getDemoPortfolio = (username = 'portfolio', personName = '') => {
  const isNamed = Boolean(personName && personName.trim() && personName.toLowerCase() !== 'alex morgan');
  const displayName = isNamed ? personName.trim() : 'My Portfolio';

  return {
    _id: 'port_demo_' + username,
    userId: 'user_public',
    name: displayName,
    username: (username || 'portfolio').toLowerCase(),
    template: 'modern',
    title: isNamed ? `${displayName} | Full Stack Engineer` : 'My Portfolio',
    theme: {
      primaryColor: '#6366f1',
      darkMode: true
    },
    content: {
      hero: {
        headline: isNamed ? `Hi, I am ${displayName}` : 'My Portfolio',
        subheadline: 'Full Stack Engineer crafting high-performance web applications with React, Node.js, and Cloud AI.',
        ctaText: 'Explore Projects'
      },
      about: {
        bio: isNamed
          ? `Passionate developer with experience building modern web applications, scalable systems, and clean user experiences.`
          : 'Welcome to this professional portfolio site. Build and publish your custom portfolio from the Portfolio Builder to feature your verified projects and resume details.',
        highlights: ['Full Stack Architecture', 'RESTful API Engineering', 'Cloud Deployment & DevOps']
      },
      skills: ['JavaScript', 'TypeScript', 'React.js', 'Node.js', 'Express.js', 'MongoDB', 'Tailwind CSS', 'Git'],
      education: [],
      experience: [],
      projects: [],
      certifications: [],
      contact: {
        email: '',
        linkedin: '',
        github: ''
      }
    },
    publicUrl: `/portfolio/${(username || 'portfolio').toLowerCase()}`,
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

// @desc Create / Generate Portfolio
// @route POST /api/portfolio
const createOrUpdatePortfolio = async (req, res) => {
  try {
    if (!getIsConnected()) {
      return res.status(503).json({
        error: 'Database Unavailable',
        message: 'MongoDB is disconnected. Cannot save portfolio. Please configure MONGODB_URI in server/.env.'
      });
    }

    const userId = req.user._id;
    const { username, template = 'modern', theme, resumeId } = req.body;

    const formattedUsername = (username || req.user.name || 'user')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');

    // Fetch resume data to construct portfolio content
    let resumeObj = null;
    if (resumeId) {
      resumeObj = await findResumeByIdOrUser(resumeId, userId);
    }
    if (!resumeObj) {
      resumeObj = await findResumeByIdOrUser(null, userId);
    }

    // Resolve person's display name according to strict requirements:
    // 1. From selected resume (personalInfo.fullName)
    // 2. From saved user profile (req.user.name)
    // 3. Fallback to neutral "My Portfolio" (never use URL username as person's real name, never Alex Morgan)
    const resumeFullName = resumeObj?.personalInfo?.fullName?.trim();
    const userProfileName = req.user?.name?.trim();

    let resolvedName = '';
    if (resumeFullName && resumeFullName.toLowerCase() !== 'alex morgan') {
      resolvedName = resumeFullName;
    } else if (userProfileName && userProfileName.toLowerCase() !== 'alex morgan') {
      resolvedName = userProfileName;
    } else {
      resolvedName = 'My Portfolio';
    }

    const isNeutral = resolvedName === 'My Portfolio';
    const headline = isNeutral ? 'My Portfolio' : `Hi, I am ${resolvedName}`;
    const pageTitle = isNeutral ? 'My Portfolio' : `${resolvedName} | Full Stack Engineer`;

    // Extract skills safely
    const rawSkills = [
      ...(resumeObj?.skills?.languages || []),
      ...(resumeObj?.skills?.frameworks || []),
      ...(resumeObj?.skills?.tools || []),
      ...(resumeObj?.skills?.databases || [])
    ].filter(Boolean);

    const skills = rawSkills.length > 0
      ? [...new Set(rawSkills)]
      : ['JavaScript', 'TypeScript', 'React.js', 'Node.js', 'Express.js', 'MongoDB', 'Tailwind CSS', 'Git'];

    const portfolioContent = {
      hero: {
        headline,
        subheadline: resumeObj?.summary || 'Full Stack Software Engineer creating innovative web solutions.',
        ctaText: 'Explore Projects'
      },
      about: {
        bio: resumeObj?.summary || (isNeutral
          ? 'Welcome to my professional portfolio showcasing my projects, technical skills, and experience.'
          : `Passionate developer with experience building modern web applications, scalable systems, and digital solutions.`),
        highlights: resumeObj?.skills?.softSkills?.length > 0
          ? resumeObj.skills.softSkills
          : ['Full Stack Web Development', 'Clean Architecture', 'Problem Solving']
      },
      skills,
      education: (resumeObj?.education || []).map(e => ({
        degree: e.degree || '',
        college: e.college || '',
        year: e.startYear && e.endYear ? `${e.startYear} - ${e.endYear}` : (e.endYear || e.startYear || '')
      })).filter(e => e.degree || e.college),
      experience: (resumeObj?.experience || []).map(e => ({
        company: e.company || '',
        role: e.role || '',
        duration: e.startDate && e.endDate ? `${e.startDate} - ${e.endDate}` : (e.endDate || e.startDate || ''),
        highlights: Array.isArray(e.responsibilities) ? e.responsibilities : []
      })).filter(e => e.company || e.role),
      projects: (resumeObj?.projects || []).map(p => ({
        title: p.name || p.title || '',
        description: p.description || '',
        tech: Array.isArray(p.technologies) ? p.technologies : (Array.isArray(p.tech) ? p.tech : []),
        github: p.github || '',
        liveUrl: p.liveDemo || p.liveUrl || ''
      })).filter(p => p.title),
      certifications: (resumeObj?.certifications || []).map(c => ({
        name: c.name || '',
        issuer: c.organization || c.issuer || '',
        year: c.date || c.year || ''
      })).filter(c => c.name),
      contact: {
        email: resumeObj?.personalInfo?.email || req.user.email || '',
        linkedin: resumeObj?.personalInfo?.linkedin || '',
        github: resumeObj?.personalInfo?.github || ''
      }
    };

    let portfolio = await Portfolio.findOne({ userId });
    if (portfolio) {
      portfolio.username = formattedUsername;
      portfolio.title = pageTitle;
      portfolio.template = template;
      portfolio.theme = theme || portfolio.theme;
      portfolio.content = portfolioContent;
      portfolio.publicUrl = `/portfolio/${formattedUsername}`;
      await portfolio.save();
    } else {
      portfolio = await Portfolio.create({
        userId,
        username: formattedUsername,
        title: pageTitle,
        template,
        theme: theme || { primaryColor: '#6366f1', darkMode: true },
        content: portfolioContent,
        publicUrl: `/portfolio/${formattedUsername}`
      });
    }

    return res.status(200).json(portfolio);
  } catch (error) {
    console.error('[Portfolio Error]', error);
    return res.status(500).json({ message: 'Failed to build portfolio site: ' + error.message });
  }
};

// @desc Get public portfolio by username (PUBLIC ACCESS - NO AUTH REQUIRED)
// @route GET /api/portfolio/:username
const getPublicPortfolio = async (req, res) => {
  try {
    const { username } = req.params;
    const cleanUser = (username || '').toLowerCase().trim();

    if (getIsConnected()) {
      const portfolio = await Portfolio.findOne({ username: cleanUser });
      if (portfolio) return res.json(portfolio);

      // If not found in published portfolios, check if there is a resume matching this user handle
      const resume = await findResumeByIdOrUser(null, cleanUser);
      const resumeName = resume?.personalInfo?.fullName;

      // Return safe fallback portfolio WITHOUT fake details
      return res.json(getDemoPortfolio(cleanUser, resumeName || ''));
    }

    // If database disconnected, return safe fallback portfolio without fake personal details
    return res.json(getDemoPortfolio(cleanUser, ''));
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving portfolio: ' + error.message });
  }
};

module.exports = { createOrUpdatePortfolio, getPublicPortfolio };
