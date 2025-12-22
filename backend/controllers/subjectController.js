const Subject = require('../models/Subject');
const Teacher = require('../models/Teacher');
const mongoose = require('mongoose');

// Create Subject
exports.createSubject = async (req, res, next) => {
  try {
    const { name, teachers } = req.body;

    // ✅ Check if subject name already exists (case-insensitive)
    const existingName = await Subject.findOne({ 
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } 
    });
    if (existingName) {
      return res.status(400).json({
        success: false,
        error: 'Subject name already exists'
      });
    }

    // ✅ Validate teachers if provided
    if (teachers && teachers.length > 0) {
      const teacherDocs = await Teacher.find({ _id: { $in: teachers } });
      
      if (teacherDocs.length !== teachers.length) {
        const foundIds = teacherDocs.map(t => t._id.toString());
        const invalidIds = teachers.filter(id => !foundIds.includes(id.toString()));
        
        return res.status(400).json({
          success: false,
          error: `Invalid teacher IDs: ${invalidIds.join(', ')}`
        });
      }
    }

    // Create subject
    const subject = await Subject.create({
      name: name.trim(),
      teachers: teachers || []
    });

    // ✅ Update Teacher.subjects arrays - add this subject ID to all teachers
    if (teachers && teachers.length > 0) {
      await Teacher.updateMany(
        { _id: { $in: teachers } },
        { $addToSet: { subjects: subject._id } }
      );
    }

    // Populate and return
    const subjectData = await Subject.findById(subject._id)
      .populate('teachers', 'name surname email')
      .lean();

    res.status(201).json({
      success: true,
      data: subjectData
    });
  } catch (error) {
    // Duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Subject name already exists'
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

// Get All Subjects
exports.getAllSubjects = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, teacherId } = req.query;
    
    const query = {};
    
    // ✅ Search by name
    if (search && typeof search === 'string' && search.trim()) {
      const sanitizedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.name = { $regex: sanitizedSearch, $options: 'i' };
    }

    // ✅ Filter by teacher
    if (teacherId && mongoose.Types.ObjectId.isValid(teacherId)) {
      query.teachers = teacherId;
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));

    const subjects = await Subject.find(query)
      .populate('teachers', 'name surname email')
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .sort({ name: 1 }) // Sort alphabetically
      .lean();

    const count = await Subject.countDocuments(query);

    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
      data: subjects
    });
  } catch (error) {
    next(error);
  }
};

// Get Single Subject
exports.getSubject = async (req, res, next) => {
  try {
    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid subject ID format'
      });
    }

    const subject = await Subject.findById(req.params.id)
      .populate('teachers', 'name surname email phone');
    
    if (!subject) {
      return res.status(404).json({
        success: false,
        error: 'Subject not found'
      });
    }

    res.status(200).json({
      success: true,
      data: subject
    });
  } catch (error) {
    next(error);
  }
};

// Update Subject
exports.updateSubject = async (req, res, next) => {
  try {
    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid subject ID format'
      });
    }

    const { name, teachers } = req.body;

    // ✅ Check if subject exists
    const currentSubject = await Subject.findById(req.params.id);
    if (!currentSubject) {
      return res.status(404).json({
        success: false,
        error: 'Subject not found'
      });
    }

    // ✅ Check for duplicate name (if changing)
    if (name && name.trim().toLowerCase() !== currentSubject.name.toLowerCase()) {
      const existingName = await Subject.findOne({ 
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
        _id: { $ne: req.params.id }
      });
      if (existingName) {
        return res.status(400).json({
          success: false,
          error: 'Subject name already exists'
        });
      }
    }

    // ✅ Validate teachers if provided
    if (teachers !== undefined && teachers.length > 0) {
      const teacherDocs = await Teacher.find({ _id: { $in: teachers } });
      
      if (teacherDocs.length !== teachers.length) {
        const foundIds = teacherDocs.map(t => t._id.toString());
        const invalidIds = teachers.filter(id => !foundIds.includes(id.toString()));
        
        return res.status(400).json({
          success: false,
          error: `Invalid teacher IDs: ${invalidIds.join(', ')}`
        });
      }
    }

    // Update subject
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (teachers !== undefined) updateData.teachers = teachers;

    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('teachers', 'name surname email');

    // ✅ Update Teacher.subjects arrays if teachers were updated
    if (teachers !== undefined) {
      const oldTeacherIds = currentSubject.teachers.map(t => t.toString());
      const newTeacherIds = teachers.map(t => t.toString());
      
      // Find teachers that were removed
      const removedTeacherIds = oldTeacherIds.filter(id => !newTeacherIds.includes(id));
      // Find teachers that were added
      const addedTeacherIds = newTeacherIds.filter(id => !oldTeacherIds.includes(id));

      // Remove subject ID from removed teachers
      if (removedTeacherIds.length > 0) {
        await Teacher.updateMany(
          { _id: { $in: removedTeacherIds } },
          { $pull: { subjects: req.params.id } }
        );
      }

      // Add subject ID to newly added teachers
      if (addedTeacherIds.length > 0) {
        await Teacher.updateMany(
          { _id: { $in: addedTeacherIds } },
          { $addToSet: { subjects: req.params.id } }
        );
      }
    }

    res.status(200).json({
      success: true,
      data: subject
    });
  } catch (error) {
    // Duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Subject name already exists'
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

// Delete Subject
exports.deleteSubject = async (req, res, next) => {
  try {
    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid subject ID format'
      });
    }

    const subject = await Subject.findById(req.params.id);
    
    if (!subject) {
      return res.status(404).json({
        success: false,
        error: 'Subject not found'
      });
    }

    // ✅ Remove subject ID from all Teacher.subjects arrays before deleting
    if (subject.teachers && subject.teachers.length > 0) {
      await Teacher.updateMany(
        { _id: { $in: subject.teachers } },
        { $pull: { subjects: req.params.id } }
      );
    }

    // Delete subject
    await Subject.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {},
      message: 'Subject deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};