const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const fallbackStore = require('../config/fallbackStore');
const { getDBStatus } = require('../config/db');
const { JWT_SECRET } = require('../middleware/authMiddleware');

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

// Register (FR1)
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, preferredRole, experienceLevel } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email, and password.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.'
      });
    }

    const dbStatus = getDBStatus();
    let existingUser;

    if (!dbStatus.useFallbackStore) {
      try {
        existingUser = await User.findOne({ email: email.toLowerCase() });
      } catch (err) {
        existingUser = await fallbackStore.findUserByEmail(email);
      }
    } else {
      existingUser = await fallbackStore.findUserByEmail(email);
    }

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let newUser;
    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      preferredRole: preferredRole || 'Software Engineer',
      experienceLevel: experienceLevel || 'Beginner'
    };

    if (!dbStatus.useFallbackStore) {
      try {
        newUser = await User.create(userData);
      } catch (dbErr) {
        newUser = await fallbackStore.createUser(userData);
      }
    } else {
      newUser = await fallbackStore.createUser(userData);
    }

    const token = generateToken(newUser._id.toString());

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      data: {
        user: {
          id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
          preferredRole: newUser.preferredRole,
          experienceLevel: newUser.experienceLevel,
          createdAt: newUser.createdAt
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// Login (FR1)
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const dbStatus = getDBStatus();
    let user;

    if (!dbStatus.useFallbackStore) {
      try {
        user = await User.findOne({ email: email.toLowerCase() }).select('+password');
      } catch (err) {
        user = await fallbackStore.findUserByEmail(email);
      }
    } else {
      user = await fallbackStore.findUserByEmail(email);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please try again.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please try again.'
      });
    }

    const token = generateToken(user._id.toString());

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          preferredRole: user.preferredRole,
          experienceLevel: user.experienceLevel,
          createdAt: user.createdAt
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get Current User (FR1, FR3)
exports.getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update Profile (FR3)
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, preferredRole, experienceLevel } = req.body;
    const userId = req.user._id;

    const updates = {};
    if (name) updates.name = name.trim();
    if (preferredRole) updates.preferredRole = preferredRole.trim();
    if (experienceLevel) updates.experienceLevel = experienceLevel;

    const dbStatus = getDBStatus();
    let updated;

    if (!dbStatus.useFallbackStore) {
      try {
        updated = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password');
      } catch (err) {
        updated = await fallbackStore.updateUser(userId, updates);
      }
    } else {
      updated = await fallbackStore.updateUser(userId, updates);
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: updated._id.toString(),
          name: updated.name,
          email: updated.email,
          preferredRole: updated.preferredRole,
          experienceLevel: updated.experienceLevel
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
