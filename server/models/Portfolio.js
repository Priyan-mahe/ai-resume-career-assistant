const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      default: '',
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    template: {
      type: String,
      default: 'modern',
    },
    title: {
      type: String,
      default: 'Portfolio',
    },
    theme: {
      primaryColor: { type: String, default: '#6366f1' },
      darkMode: { type: Boolean, default: true },
    },
    content: {
      name: String,
      hero: {
        name: String,
        headline: String,
        subheadline: String,
        ctaText: String,
      },
      about: {
        bio: String,
        highlights: [String],
      },
      skills: [String],
      education: [
        {
          degree: String,
          college: String,
          year: String,
        },
      ],
      experience: [
        {
          company: String,
          role: String,
          duration: String,
          highlights: [String],
        },
      ],
      projects: [
        {
          title: String,
          description: String,
          tech: [String],
          github: String,
          liveUrl: String,
        },
      ],
      certifications: [
        {
          name: String,
          issuer: String,
          year: String,
        },
      ],
      contact: {
        email: String,
        phone: String,
        location: String,
        linkedin: String,
        github: String,
      },
    },
    publicUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Portfolio', portfolioSchema);
