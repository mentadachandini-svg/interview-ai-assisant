const jwt = require('jsonwebtoken');
const User = require('../models/User');
const fallbackStore = require('../config/fallbackStore');
const { getDBStatus } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'interview_ai_jwt_super_secret_dev_key_2026';

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      const dbStatus = getDBStatus();
      let user;

      if (!dbStatus.useFallbackStore) {
        try {
          user = await User.findById(decoded.id).select('-password');
        } catch (dbErr) {
          // If mongo fails dynamically, check fallback
          user = await fallbackStore.findUserById(decoded.id);
        }
      } else {
        user = await fallbackStore.findUserById(decoded.id);
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User session not found or expired. Please log in again.'
        });
      }

      req.user = {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        preferredRole: user.preferredRole,
        experienceLevel: user.experienceLevel
      };

      next();
    } catch (error) {
      console.error('Auth verification error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authorization token'
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.'
    });
  }
};

module.exports = { protect, JWT_SECRET };
