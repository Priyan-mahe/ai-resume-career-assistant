const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    profile: {
      bio: { type: String, default: '' },
      targetRole: { type: String, default: '' },
      location: { type: String, default: '' },
      github: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      website: { type: String, default: '' },
    },
    skills: [{ type: String }],
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
    preferences: {
      notifications: { type: Boolean, default: true },
      aiProvider: { type: String, default: 'gemini' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
