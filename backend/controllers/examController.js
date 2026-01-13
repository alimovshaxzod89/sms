const mongoose = require('mongoose');
const Exam = require('../models/Exam');
const Lesson = require('../models/Lesson');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Parent = require('../models/Parent');

// Create Exam
exports.createExam = async (req, res, next) => {
  try {
    const { title, startTime, endTime, lessonId } = req.body;

    // Validate lessonId format
    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid lesson ID format'
      });
    }

    // Verify lesson exists
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: 'Lesson not found'
      });
    }

    // Validate time logic
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format'
      });
    }
    
    if (start >= end) {
      return res.status(400).json({
        success: false,
        error: 'End time must be after start time'
      });
    }

    if (start < new Date()) {
      return res.status(400).json({
        success: false,
        error: 'Start time cannot be in the past'
      });
    }

    // Check for overlapping exams for the same lesson
    const overlappingExam = await Exam.findOne({
      lessonId,
      $or: [
        { startTime: { $lt: end, $gte: start } },
        { endTime: { $gt: start, $lte: end } },
        { startTime: { $lte: start }, endTime: { $gte: end } }
      ]
    });

    if (overlappingExam) {
      return res.status(400).json({
        success: false,
        error: 'An exam already exists for this lesson during the specified time'
      });
    }

    const exam = await Exam.create({
      title,
      startTime,
      endTime,
      lessonId
    });

    // ✅ Populate lesson ma'lumotlari bilan qaytarish
    const examWithDetails = await Exam.findById(exam._id)
      .populate({
        path: 'lessonId',
        populate: [
          { path: 'subjectId', select: 'name' },
          { path: 'classId', select: 'name' }
        ]
      })
      .lean();

    // ✅ Manual populate teacher
    if (examWithDetails.lessonId && examWithDetails.lessonId.teacherId) {
      // teacherId ni stringga aylantirish (agar object bo'lsa)
      const teacherIdString = typeof examWithDetails.lessonId.teacherId === 'string' 
        ? examWithDetails.lessonId.teacherId 
        : (examWithDetails.lessonId.teacherId?.id || examWithDetails.lessonId.teacherId?._id?.toString() || examWithDetails.lessonId.teacherId);
      
      const teacher = await Teacher.findOne({ id: teacherIdString })
        .select('id name surname')
        .lean();
      
      examWithDetails.lessonId.teacherId = teacher || { id: teacherIdString };
    }

    res.status(201).json({
      success: true,
      data: examWithDetails
    });
  } catch (error) {
    console.error('Error in createExam:', error);
    
    // Mongoose validation error
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

// Get All Exams
exports.getAllExams = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, classId, teacherId } = req.query;
    const userRole = req.user.role;
    
    let query = {};
    
    // Build lesson query for filtering
    let lessonQuery = {};
    
    // ✅ Student rol uchun: faqat o'z classId'siga tegishli exams
    if (userRole === 'student') {
      // req.user'da classId mavjud bo'lishi kerak (auth middleware'da student yuklangan)
      if (!req.user.classId) {
        // Agar classId mavjud bo'lmasa, student'ni qaytadan yuklash
        const student = await Student.findOne({ 
          $or: [
            { _id: req.user._id },
            { id: req.user.id || req.user._id }
          ]
        }).select('classId').lean();
        
        if (!student || !student.classId) {
          return res.status(400).json({
            success: false,
            error: 'Student class information not found'
          });
        }
        
        req.user.classId = student.classId;
      }
      
      // classId ObjectId yoki string formatida bo'lishi mumkin
      const studentClassId = req.user.classId._id 
        ? req.user.classId._id.toString() 
        : req.user.classId.toString();
      
      if (!mongoose.Types.ObjectId.isValid(studentClassId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid student class ID'
        });
      }
      
      lessonQuery.classId = studentClassId;
    }
    
    // ✅ Parent rol uchun: farzandlarining classId'lariga tegishli exams
    if (userRole === 'parent') {
      const students = await Student.find({ parentId: req.user.id })
        .select('classId')
        .lean();
      
      if (students.length === 0) {
        return res.status(200).json({
          success: true,
          count: 0,
          totalPages: 0,
          currentPage: parseInt(page),
          data: []
        });
      }
      
      // Barcha farzandlarining classId'larini olish
      const studentClassIds = students
        .map(s => {
          if (!s.classId) return null;
          return s.classId._id ? s.classId._id.toString() : s.classId.toString();
        })
        .filter(id => id && mongoose.Types.ObjectId.isValid(id));
      
      if (studentClassIds.length === 0) {
        return res.status(200).json({
          success: true,
          count: 0,
          totalPages: 0,
          currentPage: parseInt(page),
          data: []
        });
      }
      
      lessonQuery.classId = { $in: studentClassIds };
    }
    
    // ✅ Teacher role'da bo'lsa, faqat o'ziga tegishli lesson'lardagi exam'larni ko'rsatish
    if (userRole === 'teacher') {
      const loggedInTeacherId = req.user.id || req.user._id?.toString();
      
      if (!loggedInTeacherId) {
        return res.status(400).json({
          success: false,
          error: 'Teacher ID not found'
        });
      }

      // Faqat o'sha teacher'ning lesson'larini filter qilish
      lessonQuery.teacherId = loggedInTeacherId;
    }
    
    // Validate ObjectIds for classId (admin uchun query parametrdan)
    if (classId && userRole === 'admin') {
      if (!mongoose.Types.ObjectId.isValid(classId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid class ID format'
        });
      }
      lessonQuery.classId = classId;
    }
    
    // teacherId is String type, not ObjectId (faqat admin uchun query parametrdan)
    if (teacherId && userRole === 'admin') {
      lessonQuery.teacherId = teacherId;
    }
    
    // If we have lesson filters, find matching lessons first
    if (Object.keys(lessonQuery).length > 0) {
      const lessons = await Lesson.find(lessonQuery).select('_id').lean();
      
      // If no lessons found, return empty result
      if (lessons.length === 0) {
        return res.status(200).json({
          success: true,
          count: 0,
          totalPages: 0,
          currentPage: parseInt(page),
          data: []
        });
      }
      
      query.lessonId = { $in: lessons.map(l => l._id) };
    }
    
    // Search by title with sanitization
    if (search && typeof search === 'string') {
      const sanitizedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.title = { $regex: sanitizedSearch, $options: 'i' };
    }

    // Validate and sanitize pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));

    // ✅ Populate without teacherId (manual populate kerak)
    const exams = await Exam.find(query)
      .populate({
        path: 'lessonId',
        populate: [
          { path: 'subjectId', select: 'name' },
          { path: 'classId', select: 'name' }
        ]
      })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .sort({ startTime: -1 })
      .lean();

    // ✅ Manual populate teacher ma'lumotlari
    const Teacher = require('../models/Teacher');
    
    for (const exam of exams) {
      if (exam.lessonId && exam.lessonId.teacherId) {
        // teacherId ni stringga aylantirish (agar object bo'lsa)
        const teacherIdString = typeof exam.lessonId.teacherId === 'string' 
          ? exam.lessonId.teacherId 
          : (exam.lessonId.teacherId?.id || exam.lessonId.teacherId?._id?.toString() || exam.lessonId.teacherId);
        
        const teacher = await Teacher.findOne({ id: teacherIdString })
          .select('id name surname')
          .lean();
        
        exam.lessonId.teacherId = teacher || { id: teacherIdString };
      }
    }

    const count = await Exam.countDocuments(query);

    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
      data: exams
    });
  } catch (error) {
    console.error('Error in getAllExams:', error);
    next(error);
  }
};

// Get Single Exam
exports.getExam = async (req, res, next) => {
  try {
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid exam ID format'
      });
    }

    const userRole = req.user.role;
    
    // ✅ Exam ni topish
    const exam = await Exam.findById(req.params.id)
      .populate({
        path: 'lessonId',
        populate: [
          { path: 'subjectId', select: 'name' },
          { path: 'classId', select: 'name capacity' }
        ]
      })
      .lean();
    
    if (!exam) {
      return res.status(404).json({
        success: false,
        error: 'Exam not found'
      });
    }

    // ✅ Student rol uchun: exam o'z classId'siga tegishli ekanligini tekshirish
    if (userRole === 'student') {
      if (!exam.lessonId || !exam.lessonId.classId) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to access this exam'
        });
      }
      
      // Student'ning classId'sini olish
      if (!req.user.classId) {
        const student = await Student.findOne({ 
          $or: [
            { _id: req.user._id },
            { id: req.user.id || req.user._id }
          ]
        }).select('classId').lean();
        
        if (!student || !student.classId) {
          return res.status(403).json({
            success: false,
            error: 'Student class information not found'
          });
        }
        
        req.user.classId = student.classId;
      }
      
      const examClassId = exam.lessonId.classId._id 
        ? exam.lessonId.classId._id.toString() 
        : exam.lessonId.classId.toString();
      
      const studentClassId = req.user.classId._id 
        ? req.user.classId._id.toString() 
        : req.user.classId.toString();
      
      if (examClassId !== studentClassId) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to access this exam'
        });
      }
    }
    
    // ✅ Parent rol uchun: exam farzandlarining classId'laridan biriga tegishli ekanligini tekshirish
    if (userRole === 'parent') {
      if (!exam.lessonId || !exam.lessonId.classId) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to access this exam'
        });
      }
      
      const examClassId = exam.lessonId.classId._id 
        ? exam.lessonId.classId._id.toString() 
        : exam.lessonId.classId.toString();
      
      const students = await Student.find({ parentId: req.user.id })
        .select('classId')
        .lean();
      
      const studentClassIds = students
        .map(s => {
          if (!s.classId) return null;
          return s.classId._id ? s.classId._id.toString() : s.classId.toString();
        })
        .filter(id => id);
      
      if (!studentClassIds.includes(examClassId)) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to access this exam'
        });
      }
    }
    
    // ✅ Teacher role'da bo'lsa, faqat o'ziga tegishli lesson'dagi exam'larni ko'rish mumkin
    if (userRole === 'teacher') {
      const loggedInTeacherId = req.user.id || req.user._id?.toString();
      
      if (!loggedInTeacherId) {
        return res.status(400).json({
          success: false,
          error: 'Teacher ID not found'
        });
      }

      // Lesson'ning teacherId'sini olish
      if (!exam.lessonId || !exam.lessonId.teacherId) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to access this exam'
        });
      }

      // teacherId ni stringga aylantirish (agar object bo'lsa)
      const lessonTeacherId = typeof exam.lessonId.teacherId === 'string' 
        ? exam.lessonId.teacherId 
        : (exam.lessonId.teacherId?.id || exam.lessonId.teacherId?._id?.toString() || exam.lessonId.teacherId);

      // Agar lesson teacher'ga tegishli bo'lmasa, access denied
      if (lessonTeacherId !== loggedInTeacherId) {
        return res.status(403).json({
          success: false,
          error: 'You do not have access to this exam'
        });
      }
    }

    // ✅ Manual populate teacher ma'lumotlari
    if (exam.lessonId && exam.lessonId.teacherId) {
      // teacherId ni stringga aylantirish (agar object bo'lsa)
      const teacherIdString = typeof exam.lessonId.teacherId === 'string' 
        ? exam.lessonId.teacherId 
        : (exam.lessonId.teacherId?.id || exam.lessonId.teacherId?._id?.toString() || exam.lessonId.teacherId);
      
      const teacher = await Teacher.findOne({ id: teacherIdString })
        .select('id name surname email phone')
        .lean();
      
      exam.lessonId.teacherId = teacher || { id: teacherIdString };
    }

    res.status(200).json({
      success: true,
      data: exam
    });
  } catch (error) {
    console.error('Error in getExam:', error);
    next(error);
  }
};

// Update Exam
exports.updateExam = async (req, res, next) => {
  try {
    // Validate exam ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid exam ID format'
      });
    }

    const { title, startTime, endTime, lessonId } = req.body;

    // Verify lesson exists if lessonId is being updated
    if (lessonId) {
      if (!mongoose.Types.ObjectId.isValid(lessonId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid lesson ID format'
        });
      }

      const lesson = await Lesson.findById(lessonId);
      if (!lesson) {
        return res.status(404).json({
          success: false,
          error: 'Lesson not found'
        });
      }
    }

    // Validate time logic if both times are provided
    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid date format'
        });
      }
      
      if (start >= end) {
        return res.status(400).json({
          success: false,
          error: 'End time must be after start time'
        });
      }
    }

    // Build update object
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (startTime !== undefined) updateData.startTime = startTime;
    if (endTime !== undefined) updateData.endTime = endTime;
    if (lessonId !== undefined) updateData.lessonId = lessonId;

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    // ✅ Update without populate (teacherId ni populate qilmaslik)
    const exam = await Exam.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate({
      path: 'lessonId',
      populate: [
        { path: 'subjectId', select: 'name' },
        { path: 'classId', select: 'name capacity' }
      ]
    })
    .lean();

    if (!exam) {
      return res.status(404).json({
        success: false,
        error: 'Exam not found'
      });
    }

    // ✅ Manual populate teacher ma'lumotlari
    if (exam.lessonId && exam.lessonId.teacherId) {
      // teacherId ni stringga aylantirish (agar object bo'lsa)
      const teacherIdString = typeof exam.lessonId.teacherId === 'string' 
        ? exam.lessonId.teacherId 
        : (exam.lessonId.teacherId?.id || exam.lessonId.teacherId?._id?.toString() || exam.lessonId.teacherId);
      
      const teacher = await Teacher.findOne({ id: teacherIdString })
        .select('id name surname email phone')
        .lean();
      
      exam.lessonId.teacherId = teacher || { id: teacherIdString };
    }

    res.status(200).json({
      success: true,
      data: exam
    });
  } catch (error) {
    console.error('Error in updateExam:', error);
    
    // Mongoose validation error
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

// Delete Exam
exports.deleteExam = async (req, res, next) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        error: 'Exam not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};