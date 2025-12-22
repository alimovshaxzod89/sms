const Teacher = require('../models/Teacher');
const Subject = require('../models/Subject');
const Class = require('../models/Class');
const Lesson = require('../models/Lesson');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// ✅ Helper function for checking ownership
const checkTeacherOwnership = (req, teacherId) => {
  if (req.user.role === 'teacher' && req.user._id.toString() !== teacherId) {
    return false;
  }
  return true;
};

// Create Teacher
exports.createTeacher = async (req, res, next) => {
  try {
    const { username, password, name, surname, email, phone, address, bloodType, birthday, sex, subjects } = req.body;

    // ✅ Check if username already exists
    const existingUsername = await Teacher.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        error: 'Username already exists'
      });
    }

    // ✅ Check if email already exists (if provided)
    if (email) {
      const existingEmail = await Teacher.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          error: 'Email already exists'
        });
      }
    }

    // ✅ Validate subjects if provided
    if (subjects && subjects.length > 0) {
      const subjectDocs = await Subject.find({ _id: { $in: subjects } });
      
      if (subjectDocs.length !== subjects.length) {
        const foundIds = subjectDocs.map(s => s._id.toString());
        const invalidIds = subjects.filter(id => !foundIds.includes(id.toString()));
        
        return res.status(400).json({
          success: false,
          error: `Invalid subject IDs: ${invalidIds.join(', ')}`
        });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Generate unique teacher ID
    const teacher = await Teacher.create({
      id: `teacher_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username,
      password: hashedPassword,
      name,
      surname,
      email: email || null,
      phone: phone || null,
      address,
      bloodType,
      birthday,
      sex: sex.toLowerCase(),
      subjects: subjects || []
    });

    // ✅ Populate and remove password
    const teacherData = await Teacher.findById(teacher._id)
      .populate('subjects', 'name code')
      .select('-password')
      .lean();

    res.status(201).json({
      success: true,
      data: teacherData
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

// Get All Teachers
exports.getAllTeachers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, subjectId } = req.query;
    
    const query = {};
    
    // ✅ Search by name, surname, username, or email
    if (search && typeof search === 'string' && search.trim()) {
      const sanitizedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: { $regex: sanitizedSearch, $options: 'i' } },
        { surname: { $regex: sanitizedSearch, $options: 'i' } },
        { username: { $regex: sanitizedSearch, $options: 'i' } },
        { email: { $regex: sanitizedSearch, $options: 'i' } }
      ];
    }

    // ✅ Filter by subject
    if (subjectId && mongoose.Types.ObjectId.isValid(subjectId)) {
      query.subjects = subjectId;
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));

    const teachers = await Teacher.find(query)
      .populate('subjects', 'name code')
      .select('-password')
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .sort({ createdAt: -1 })
      .lean();

    const count = await Teacher.countDocuments(query);
    
    // ✅ Har bir teacher uchun classes ma'lumotlarini qo'shish
    const Grade = require('../models/Grade');
    const teachersWithClasses = await Promise.all(
      teachers.map(async (teacher) => {
        // Class modelidan supervisorId bo'yicha qidirish (teacher.id String sifatida)
        const classes = await Class.find({ supervisorId: teacher.id })
          .select('_id name capacity gradeId')
          .lean();
        
        // Grade ma'lumotlarini populate qilish
        const classesWithGrade = await Promise.all(
          classes.map(async (cls) => {
            if (cls.gradeId) {
              const grade = await Grade.findById(cls.gradeId)
                .select('level')
                .lean();
              cls.gradeId = grade || cls.gradeId;
            }
            return cls;
          })
        );
        
        return {
          ...teacher,
          classes: classesWithGrade
        };
      })
    );
    
    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
      data: teachersWithClasses
    });
  } catch (error) {
    next(error);
  }
};

// Get Single Teacher
exports.getTeacher = async (req, res, next) => {
  try {
    let teacher;
    
    // ✅ Try to find by MongoDB ObjectId first, then by custom id
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      teacher = await Teacher.findById(req.params.id)
        .populate('subjects', 'name code')
        .select('-password')
        .lean();
    }
    
    if (!teacher) {
      teacher = await Teacher.findOne({ id: req.params.id })
        .populate('subjects', 'name code')
        .select('-password')
        .lean();
    }
    
    if (!teacher) {
      return res.status(404).json({
        success: false,
        error: 'Teacher not found'
      });
    }

    // ✅ Teacher uchun classes ma'lumotlarini qo'shish
    const Grade = require('../models/Grade');
    const classes = await Class.find({ supervisorId: teacher.id })
      .select('_id name capacity gradeId')
      .lean();
    
    // Grade ma'lumotlarini populate qilish
    const classesWithGrade = await Promise.all(
      classes.map(async (cls) => {
        if (cls.gradeId) {
          const grade = await Grade.findById(cls.gradeId)
            .select('level')
            .lean();
          cls.gradeId = grade || cls.gradeId;
        }
        return cls;
      })
    );
    
    teacher.classes = classesWithGrade;

    // ✅ Teachers can only view their own full profile
    // Students and other roles get limited info
    if (req.user.role === 'student') {
      // Students can only see basic teacher info
      const limitedInfo = {
        _id: teacher._id,
        id: teacher.id,
        name: teacher.name,
        surname: teacher.surname,
        email: teacher.email,
        subjects: teacher.subjects,
        classes: teacher.classes
      };
      
      return res.status(200).json({
        success: true,
        data: limitedInfo
      });
    }

    res.status(200).json({
      success: true,
      data: teacher
    });
  } catch (error) {
    next(error);
  }
};

// Update Teacher
exports.updateTeacher = async (req, res, next) => {
  try {
    let teacherId = req.params.id;
    
    // ✅ Find teacher by ObjectId or custom id
    let currentTeacher;
    if (mongoose.Types.ObjectId.isValid(teacherId)) {
      currentTeacher = await Teacher.findById(teacherId);
    } else {
      currentTeacher = await Teacher.findOne({ id: teacherId });
      if (currentTeacher) {
        teacherId = currentTeacher._id.toString();
      }
    }

    if (!currentTeacher) {
      return res.status(404).json({
        success: false,
        error: 'Teacher not found'
      });
    }

    // ✅ Check ownership (teachers can only update their own profile)
    if (!checkTeacherOwnership(req, teacherId)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this teacher profile'
      });
    }

    const { 
      username, 
      password,
      name, 
      surname, 
      email, 
      phone, 
      address, 
      bloodType, 
      birthday, 
      sex, 
      subjects 
    } = req.body;

    // ✅ Teachers cannot change their subjects (only admin can)
    if (req.user.role === 'teacher' && subjects !== undefined) {
      return res.status(403).json({
        success: false,
        error: 'Teachers cannot modify their own subject assignments. Please contact an administrator.'
      });
    }

    // ✅ Check for duplicate username
    if (username) {
      const existingUsername = await Teacher.findOne({ 
        username, 
        _id: { $ne: teacherId } 
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
      const existingEmail = await Teacher.findOne({ 
        email, 
        _id: { $ne: teacherId } 
      });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          error: 'Email already exists'
        });
      }
    }

    // ✅ Validate subjects if being updated
    if (subjects !== undefined && subjects.length > 0) {
      const subjectDocs = await Subject.find({ _id: { $in: subjects } });
      
      if (subjectDocs.length !== subjects.length) {
        const foundIds = subjectDocs.map(s => s._id.toString());
        const invalidIds = subjects.filter(id => !foundIds.includes(id.toString()));
        
        return res.status(400).json({
          success: false,
          error: `Invalid subject IDs: ${invalidIds.join(', ')}`
        });
      }
    }

    const updateData = {
      username,
      name,
      surname,
      email: email || null,
      phone: phone || null,
      address,
      bloodType,
      birthday,
      sex: sex ? sex.toLowerCase() : undefined,
      subjects
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );

    // Hash new password if provided
    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const teacher = await Teacher.findByIdAndUpdate(
      teacherId,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('subjects', 'name code')
      .select('-password')
      .lean();

    res.status(200).json({
      success: true,
      data: teacher
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

// Delete Teacher
exports.deleteTeacher = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    let teacher;
    
    // ✅ Find and delete teacher
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      teacher = await Teacher.findByIdAndDelete(req.params.id).session(session);
    } else {
      teacher = await Teacher.findOneAndDelete({ id: req.params.id }).session(session);
    }

    if (!teacher) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        error: 'Teacher not found'
      });
    }

    // ✅ Update related classes (remove teacher reference)
    await Class.updateMany(
      { supervisorId: teacher._id },
      { $unset: { supervisorId: "" } },
      { session }
    );

    // ✅ Update related lessons (remove teacher reference)
    await Lesson.updateMany(
      { teacherId: teacher._id },
      { $unset: { teacherId: "" } },
      { session }
    );

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      data: {},
      message: 'Teacher deleted successfully and related records updated'
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};