//controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Parent = require('../models/Parent');
const TokenBlacklist = require('../models/TokenBlacklist');

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { username, password, role } = req.body;

    // Validate input
    if (!username || !password || !role) {
      return res.status(400).json({
        success: false,
        error: 'Please provide username, password and role'
      });
    }

    let user;
    let userRole = role;

    // Find user based on role
    switch (role) {
      case 'teacher':
        user = await Teacher.findOne({ username }).select('+password');
        break;
      case 'student':
        user = await Student.findOne({ username }).select('+password');
        break;
      case 'parent':
        user = await Parent.findOne({ username }).select('+password');
        break;
      case 'admin':
        // Admin check - you can customize this
        if (username === process.env.ADMIN_USERNAME && 
            password === process.env.ADMIN_PASSWORD) {
          const token = generateToken('admin', 'admin');
          return res.status(200).json({
            success: true,
            token,
            user: {
              id: 'admin',
              username: 'admin',
              role: 'admin'
            }
          });
        } else {
          return res.status(401).json({
            success: false,
            error: 'Invalid credentials'
          });
        }
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid role'
        });
    }

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Create token
    const token = generateToken(user._id || user.id, userRole);

    // Remove password from output
    user.password = undefined;

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id || user.id,
        username: user.username,
        name: user.name,
        surname: user.surname,
        email: user.email,
        role: userRole
      }
    });

    res.status(200).json({
      success: true,
      token,
      user: userResponse
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    let user;
    const mongoose = require('mongoose');
    const userId = req.user._id || req.user.id;

    switch (req.user.role) {
      case 'teacher':
        // Try by _id first, then by id field
        if (mongoose.Types.ObjectId.isValid(userId)) {
          user = await Teacher.findById(userId);
        }
        if (!user) {
          user = await Teacher.findOne({ id: userId });
        }
        break;
      case 'student':
        if (mongoose.Types.ObjectId.isValid(userId)) {
          user = await Student.findById(userId)
            .populate('gradeId')
            .populate('classId');
        }
        if (!user) {
          user = await Student.findOne({ id: userId })
            .populate('gradeId')
            .populate('classId');
        }
        break;
      case 'parent':
        if (mongoose.Types.ObjectId.isValid(userId)) {
          user = await Parent.findById(userId);
        }
        if (!user) {
          user = await Parent.findOne({ id: userId });
        }
        if (user) {
          // Populate students for parent
          const Student = require('../models/Student');
          const students = await Student.find({ parentId: user.id })
            .select('id name surname email phone gradeId classId')
            .populate('gradeId', 'level name')
            .populate('classId', 'name capacity')
            .lean();
          user = user.toObject();
          user.students = students;
        }
        break;
      case 'admin':
        user = { id: 'admin', username: 'admin', role: 'admin' };
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid role'
        });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Please provide current and new password'
      });
    }

    let user;

    const mongoose = require('mongoose');
    const userId = req.user._id || req.user.id;

    switch (req.user.role) {
      case 'teacher':
        if (mongoose.Types.ObjectId.isValid(userId)) {
          user = await Teacher.findById(userId).select('+password');
        }
        if (!user) {
          user = await Teacher.findOne({ id: userId }).select('+password');
        }
        break;
      case 'student':
        if (mongoose.Types.ObjectId.isValid(userId)) {
          user = await Student.findById(userId).select('+password');
        }
        if (!user) {
          user = await Student.findOne({ id: userId }).select('+password');
        }
        break;
      case 'parent':
        if (mongoose.Types.ObjectId.isValid(userId)) {
          user = await Parent.findById(userId).select('+password');
        }
        if (!user) {
          user = await Parent.findOne({ id: userId }).select('+password');
        }
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Cannot update admin password through this route'
        });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    const token = generateToken(user._id || user.id, req.user.role);

    res.status(200).json({
      success: true,
      token
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'No token provided'
      });
    }

    // Decode token to get expiration time
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add token to blacklist
    await TokenBlacklist.create({
      token,
      userId: decoded.id,
      role: decoded.role,
      expiresAt: new Date(decoded.exp * 1000) // Convert to milliseconds
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
    next(error);
  }
};

// @desc    Logout from all devices
// @route   POST /api/auth/logout-all
// @access  Private

// @desc    Logout from all devices
// @route   POST /api/auth/logout-all
// @access  Private
exports.logoutAll = async (req, res, next) => {
  try {
    // ✅ Check user authentication
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // ✅ TO'G'RI: _id ishlatamiz (id emas!)
    const userId = req.user._id || req.user.id;
    const role = req.user.role;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User ID not found'
      });
    }

    // Get current token
    const currentToken = req.headers.authorization?.split(' ')[1];
    
    if (!currentToken) {
      return res.status(400).json({
        success: false,
        error: 'No token provided'
      });
    }

    // Decode and verify current token
    let decoded;
    try {
      decoded = jwt.verify(currentToken, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // ✅ Check if token is already blacklisted
    const existingBlacklist = await TokenBlacklist.findOne({ token: currentToken });
    if (existingBlacklist) {
      return res.status(400).json({
        success: false,
        error: 'Token is already invalidated'
      });
    }

    // Add current token to blacklist
    await TokenBlacklist.create({
      token: currentToken,
      userId: userId.toString(),
      role: role,
      expiresAt: new Date(decoded.exp * 1000)
    });

    // ✅ OPTIONAL: Invalidate all old tokens for this user
    // This requires storing tokens in database when logging in
    // For now, we're just invalidating the current token

    res.status(200).json({
      success: true,
      message: 'Successfully logged out from current device',
      note: 'For complete logout from all devices, please change your password or wait for other tokens to expire'
    });
  } catch (error) {
    console.error('Logout all error:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
    
    next(error);
  }
};