const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Parent = require('../models/Parent');
const TokenBlacklist = require('../models/TokenBlacklist');

exports.protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }

    try {
      // Check if token is blacklisted
      const blacklistedToken = await TokenBlacklist.findOne({ token });
      
      if (blacklistedToken) {
        return res.status(401).json({
          success: false,
          error: 'Token has been invalidated. Please login again.'
        });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user based on role
      let user;
      const userId = decoded.id;

      switch (decoded.role) {
        case 'teacher':
          // Try to find by _id (ObjectId) or id (String)
          if (mongoose.Types.ObjectId.isValid(userId)) {
            user = await Teacher.findById(userId);
          }
          // If not found by _id, try by id field
          if (!user) {
            user = await Teacher.findOne({ id: userId });
          }
          break;
        case 'student':
          if (mongoose.Types.ObjectId.isValid(userId)) {
            user = await Student.findById(userId);
          }
          if (!user) {
            user = await Student.findOne({ id: userId });
          }
          break;
        case 'parent':
          if (mongoose.Types.ObjectId.isValid(userId)) {
            user = await Parent.findById(userId);
          }
          if (!user) {
            user = await Parent.findOne({ id: userId });
          }
          break;
        case 'admin':
          user = { _id: 'admin', role: 'admin' };
          break;
        default:
          return res.status(401).json({
            success: false,
            error: 'Invalid role in token'
          });
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User no longer exists'
        });
      }

      // Handle both Mongoose documents and plain objects
      if (user._doc) {
        req.user = { ...user._doc, role: decoded.role };
      } else if (user.toObject) {
        req.user = { ...user.toObject(), role: decoded.role };
      } else {
        req.user = { ...user, role: decoded.role };
      }
      
      // Ensure _id is set properly for consistency
      if (!req.user._id && req.user.id) {
        req.user._id = req.user.id;
      }
      
      next();
    } catch (err) {
      console.error('Auth middleware error:', err);
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};