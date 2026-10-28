const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getIsConnected } = require('../config/db');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    if (!getIsConnected()) {
      return res.status(503).json({
        error: 'Database Unavailable',
        message: 'MongoDB is disconnected. Please configure your MongoDB Atlas credentials in server/.env.'
      });
    }

    try {
      token = req.headers.authorization.split(' ')[1];
      const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_resume_assistant_2026';
      const decoded = jwt.verify(token, secret);

      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ message: 'User account not found or session has expired' });
      }
      req.user = user;
      return next();
    } catch (error) {
      console.error('[Auth Middleware Error] Token verification failed:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };
