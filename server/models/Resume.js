const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      default: 'My ATS Resume',
    },
    personalInfo: {
      fullName: String,
      email: String,
      phone: String,
      location: String,
      linkedin: String,
      github: String,
      portfolio: String,
    },
    summary: {
      type: String,
      default: '',
    },
    education: [
      {
        degree: String,
        college: String,
        location: String,
        startYear: String,
        endYear: String,
        cgpa: String,
      },
    ],
    experience: [
      {
        company: String,
        role: String,
        location: String,
        startDate: String,
        endDate: String,
        responsibilities: [String],
      },
    ],
    skills: {
      languages: [String],
      frameworks: [String],
      databases: [String],
      tools: [String],
      softSkills: [String],
    },
    projects: [
      {
        name: String,
        description: String,
        technologies: [String],
        github: String,
        liveDemo: String,
      },
    ],
    certifications: [
      {
        name: String,
        organization: String,
        date: String,
        credentialUrl: String,
      },
    ],
    template: {
      type: String,
      default: 'modern',
    },
    atsScore: {
      type: Number,
      default: 85,
    },
    atsAnalysis: {
      score: Number,
      strengths: [String],
      missingKeywords: [String],
      skillGaps: [String],
      formattingIssues: [String],
      suggestions: [String],
      lastAnalyzedAt: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resume', resumeSchema);
