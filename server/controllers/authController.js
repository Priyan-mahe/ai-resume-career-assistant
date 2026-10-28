const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getIsConnected } = require('../config/db');

const generateToken = (id, email, name) => {
  const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_resume_assistant_2026';
  return jwt.sign({ id, email, name }, secret, { expiresIn: '30d' });
};

// @desc Register user
// @route POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    if (!getIsConnected()) {
      return res.status(503).json({
        error: 'Database Unavailable',
        message: 'MongoDB is currently disconnected. Cannot register new accounts. Please verify MONGODB_URI in server/.env.'
      });
    }

    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please enter all required fields (name, email, password)' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    if (password !== confirmPassword && confirmPassword !== undefined) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email address' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      skills: ['JavaScript', 'React', 'Node.js', 'REST APIs', 'Git'],
    });

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id, user.email, user.name),
    });
  } catch (error) {
    console.error('[Register Error]', error);
    return res.status(500).json({ message: 'Server error during registration: ' + error.message });
  }
};

// @desc Login user
// @route POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    if (!getIsConnected()) {
      return res.status(503).json({
        error: 'Database Unavailable',
        message: 'MongoDB is currently disconnected. Cannot authenticate accounts. Please verify MONGODB_URI in server/.env.'
      });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (user && (await bcrypt.compare(password, user.password))) {
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id, user.email, user.name),
      });
    }

    return res.status(401).json({ message: 'Invalid email or password' });
  } catch (error) {
    console.error('[Login Error]', error);
    return res.status(500).json({ message: 'Server error during login: ' + error.message });
  }
};

// @desc Get current user profile
// @route GET /api/auth/me
const getMe = async (req, res) => {
  try {
    if (!getIsConnected()) {
      return res.status(503).json({
        error: 'Database Unavailable',
        message: 'MongoDB is currently disconnected.'
      });
    }

    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User profile not found' });
    }
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving profile: ' + error.message });
  }
};

module.exports = { registerUser, loginUser, getMe };
