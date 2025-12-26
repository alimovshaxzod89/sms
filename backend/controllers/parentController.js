const Parent = require('../models/Parent');
const Student = require('../models/Student');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// ✅ Helper function for checking ownership (parent can only access own data)
const checkParentOwnership = (req, parentId) => {
  if (req.user.role === 'parent' && req.user._id.toString() !== parentId) {
    return false;
  }
  return true;
};

// Create Parent
exports.createParent = async (req, res, next) => {
  try {
    const { username, password, name, surname, email, phone, address } = req.body;

    // ✅ Check if username already exists
    const existingUsername = await Parent.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        error: 'Username already exists'
      });
    }

    // ✅ Check if email already exists (if provided)
    if (email) {
      const existingEmail = await Parent.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          error: 'Email already exists'
        });
      }
    }

    // ✅ Check if phone already exists
    const existingPhone = await Parent.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({
        success: false,
        error: 'Phone number already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Generate unique parent ID
    const parent = await Parent.create({
      id: `parent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username,
      password: hashedPassword,
      name,
      surname,
      email: email || null,
      phone,
      address
    });

    // ✅ Remove password from response
    const parentData = await Parent.findById(parent._id)
      .select('-password')
      .lean();

    res.status(201).json({
      success: true,
      data: parentData
    });
  } catch (error) {
    // Duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        error: `${field} already exists`
      });
    }
    
    // Validation error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }
    
    next(error);
  }
};

// Get All Parents
exports.getAllParents = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    
    const query = {};
    
    // ✅ Search by name, surname, username, email, or phone
    if (search && typeof search === 'string' && search.trim()) {
      const sanitizedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: { $regex: sanitizedSearch, $options: 'i' } },
        { surname: { $regex: sanitizedSearch, $options: 'i' } },
        { username: { $regex: sanitizedSearch, $options: 'i' } },
        { email: { $regex: sanitizedSearch, $options: 'i' } },
        { phone: { $regex: sanitizedSearch, $options: 'i' } }
      ];
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));

    const parents = await Parent.find(query)
      .select('-password')
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .sort({ createdAt: -1 })
      .lean();

    // ✅ Populate students for each parent
    const parentsWithStudents = await Promise.all(
      parents.map(async (parent) => {
        const students = await Student.find({ parentId: parent.id })
          .select('id name surname email phone gradeId classId')
          .populate('gradeId', 'level name')
          .populate('classId', 'name capacity')
          .lean();
        
        return {
          ...parent,
          students
        };
      })
    );

    const count = await Parent.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
      data: parentsWithStudents
    });
  } catch (error) {
    next(error);
  }
};

// Get Single Parent
exports.getParent = async (req, res, next) => {
  try {
    let parent;
    
    // ✅ Try to find by MongoDB ObjectId first, then by custom id
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      parent = await Parent.findById(req.params.id)
        .select('-password')
        .lean();
    }
    
    if (!parent) {
      parent = await Parent.findOne({ id: req.params.id })
        .select('-password')
        .lean();
    }
    
    if (!parent) {
      return res.status(404).json({
        success: false,
        error: 'Parent not found'
      });
    }

    // ✅ Check ownership (parents can only view their own profile)
    if (!checkParentOwnership(req, parent._id.toString())) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this parent profile'
      });
    }

    // ✅ Get parent's students
    const students = await Student.find({ parentId: parent.id })
      .select('id name surname email phone gradeId classId')
      .populate('gradeId', 'level name')
      .populate('classId', 'name capacity')
      .lean();
    
    parent.students = students;

    res.status(200).json({
      success: true,
      data: parent
    });
  } catch (error) {
    next(error);
  }
};

// Update Parent
exports.updateParent = async (req, res, next) => {
  try {
    let parentId = req.params.id;
    
    // ✅ Find parent by ObjectId or custom id
    let currentParent;
    if (mongoose.Types.ObjectId.isValid(parentId)) {
      currentParent = await Parent.findById(parentId);
    } else {
      currentParent = await Parent.findOne({ id: parentId });
      if (currentParent) {
        parentId = currentParent._id.toString();
      }
    }

    if (!currentParent) {
      return res.status(404).json({
        success: false,
        error: 'Parent not found'
      });
    }

    // ✅ Check ownership (parents can only update their own profile)
    if (!checkParentOwnership(req, parentId)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this parent profile'
      });
    }

    const { 
      username, 
      password,
      name, 
      surname, 
      email, 
      phone, 
      address 
    } = req.body;

    // ✅ Check for duplicate username
    if (username) {
      const existingUsername = await Parent.findOne({ 
        username, 
        _id: { $ne: parentId } 
      });
      if (existingUsername) {
        return res.status(400).json({
          success: false,
          error: 'Username already exists'
        });
      }
    }

    // ✅ Check for duplicate email
    if (email) {
      const existingEmail = await Parent.findOne({ 
        email, 
        _id: { $ne: parentId } 
      });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          error: 'Email already exists'
        });
      }
    }

    // ✅ Check for duplicate phone
    if (phone) {
      const existingPhone = await Parent.findOne({ 
        phone, 
        _id: { $ne: parentId } 
      });
      if (existingPhone) {
        return res.status(400).json({
          success: false,
          error: 'Phone number already exists'
        });
      }
    }

    const updateData = {};

    // Faqat body'da yuborilgan maydonlarni qo'shish
    if (username !== undefined) updateData.username = username;
    if (name !== undefined) updateData.name = name;
    if (surname !== undefined) updateData.surname = surname;
    if (email !== undefined) updateData.email = email || null; // Email ixtiyoriy, null bo'lishi mumkin
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;

    // Hash new password if provided
    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const parent = await Parent.findByIdAndUpdate(
      parentId,
      updateData,
      { new: true, runValidators: true }
    )
      .select('-password')
      .lean();

    res.status(200).json({
      success: true,
      data: parent
    });
  } catch (error) {
    // Duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        error: `${field} already exists`
      });
    }
    
    // Validation error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }
    
    next(error);
  }
};

// Delete Parent
exports.deleteParent = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    let parent;
    
    // ✅ Find and delete parent
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      parent = await Parent.findByIdAndDelete(req.params.id).session(session);
    } else {
      parent = await Parent.findOneAndDelete({ id: req.params.id }).session(session);
    }

    if (!parent) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        error: 'Parent not found'
      });
    }

    // ✅ Update related students (remove parent reference)
    await Student.updateMany(
      { parentId: parent.id },
      { $unset: { parentId: "" } },
      { session }
    );

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      data: {},
      message: 'Parent deleted successfully and related students updated'
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

