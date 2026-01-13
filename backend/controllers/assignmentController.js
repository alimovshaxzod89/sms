const mongoose = require('mongoose');
const Assignment = require('../models/Assignment');
const Lesson = require('../models/Lesson');
const Teacher = require('../models/Teacher');
const Subject = require('../models/Subject');
const Student = require('../models/Student');
const Parent = require('../models/Parent');

// Create Assignment
exports.createAssignment = async (req, res, next) => {
  try {
    const { title, startDate, dueDate, lessonId } = req.body;

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

    // Validate date logic
    const start = new Date(startDate);
    const due = new Date(dueDate);
    
    if (isNaN(start.getTime()) || isNaN(due.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format'
      });
    }
    
    if (due <= start) {
      return res.status(400).json({
        success: false,
        error: 'Due date must be after start date'
      });
    }

    const assignment = await Assignment.create({
      title,
      startDate,
      dueDate,
      lessonId
    });

    // Populate lesson ma'lumotlari bilan qaytarish
    const assignmentWithDetails = await Assignment.findById(assignment._id)
      .populate({
        path: 'lessonId',
        populate: [
          { path: 'subjectId', select: 'name' },
          { path: 'classId', select: 'name' }
        ]
      })
      .lean();

    // Manual populate teacher
    if (assignmentWithDetails.lessonId && assignmentWithDetails.lessonId.teacherId) {
      // teacherId string bo'lishini ta'minlash (object bo'lsa, id fieldini olish)
      let teacherIdValue = assignmentWithDetails.lessonId.teacherId;
      if (typeof teacherIdValue === 'object' && teacherIdValue !== null) {
        teacherIdValue = teacherIdValue.id;
      }
      
      // Faqat string bo'lsa Teacher ni qidirish
      if (teacherIdValue && typeof teacherIdValue === 'string') {
        const teacher = await Teacher.findOne({ id: teacherIdValue })
          .select('id name surname')
          .lean();
        
        assignmentWithDetails.lessonId.teacherId = teacher || { id: teacherIdValue };
      }
    }

    res.status(201).json({
      success: true,
      data: assignmentWithDetails
    });
  } catch (error) {
    console.error('Error in createAssignment:', error);
    
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

// Get All Assignments
exports.getAllAssignments = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, classId, teacherId, lessonId } = req.query;
    const userRole = req.user.role;
    
    let query = {};
    let filteredLessonIds = null;
    
    // Step 1: Build lesson query for filtering (classId, teacherId)
    let lessonQuery = {};
    
    // ✅ Student rol uchun: faqat o'z classId'siga tegishli assignments
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
    
    // ✅ Parent rol uchun: farzandlarining classId'lariga tegishli assignments
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
    
    // ✅ Teacher role'da bo'lsa, faqat o'ziga tegishli lesson'lardagi assignment'larni ko'rsatish
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

    // Filter by lessonId if provided
    let specificLessonId = null;
    if (lessonId) {
      if (!mongoose.Types.ObjectId.isValid(lessonId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid lesson ID format'
        });
      }
      specificLessonId = lessonId;
    }
    
    // Step 2: Apply lesson filters (classId, teacherId) to get filtered lesson IDs
    if (Object.keys(lessonQuery).length > 0) {
      const lessons = await Lesson.find(lessonQuery).select('_id').lean();
      
      if (lessons.length === 0) {
        return res.status(200).json({
          success: true,
          count: 0,
          totalPages: 0,
          currentPage: parseInt(page),
          data: []
        });
      }
      
      filteredLessonIds = lessons.map(l => l._id);
      
      // If specific lessonId was provided, check if it's in the filtered lessons
      if (specificLessonId) {
        if (!filteredLessonIds.some(id => id.toString() === specificLessonId.toString())) {
          return res.status(200).json({
            success: true,
            count: 0,
            totalPages: 0,
            currentPage: parseInt(page),
            data: []
          });
        }
        // Set the specific lessonId in query
        query.lessonId = specificLessonId;
      } else {
        query.lessonId = { $in: filteredLessonIds };
      }
    } else if (specificLessonId) {
      // No other filters but specific lessonId provided
      query.lessonId = specificLessonId;
    }
    
    // Step 3: Handle search by title and subject name
    if (search && typeof search === 'string' && search.trim()) {
      const sanitizedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // Determine which lessons to search in
      let lessonsToSearchIn = null;
      if (specificLessonId) {
        lessonsToSearchIn = [specificLessonId];
      } else if (filteredLessonIds) {
        lessonsToSearchIn = filteredLessonIds;
      }
      
      // Search by subject name through lesson
      const subjects = await Subject.find({
        name: { $regex: sanitizedSearch, $options: 'i' }
      }).select('_id').lean();
      
      let searchLessonIds = [];
      if (subjects.length > 0) {
        const subjectIds = subjects.map(s => s._id);
        let lessonQueryBySubject = { subjectId: { $in: subjectIds } };
        
        // If we have lessons to search in, intersect with them
        if (lessonsToSearchIn) {
          lessonQueryBySubject._id = { $in: lessonsToSearchIn };
        }
        
        const lessonsBySubject = await Lesson.find(lessonQueryBySubject)
          .select('_id')
          .lean();
        
        searchLessonIds = lessonsBySubject.map(l => l._id);
      }
      
      // Build search query: title OR lessonId (by subject name)
      const searchConditions = [];
      
      // Add title search condition
      if (lessonsToSearchIn) {
        searchConditions.push({
          title: { $regex: sanitizedSearch, $options: 'i' },
          lessonId: { $in: lessonsToSearchIn }
        });
      } else {
        searchConditions.push({ title: { $regex: sanitizedSearch, $options: 'i' } });
      }
      
      // Add lessonId search condition if we found lessons by subject
      if (searchLessonIds.length > 0) {
        searchConditions.push({ lessonId: { $in: searchLessonIds } });
      }
      
      // Apply search conditions
      if (searchConditions.length > 0) {
        query.$or = searchConditions;
        // Remove lessonId from query as it's now handled in $or
        if (query.lessonId) {
          delete query.lessonId;
        }
      } else if (lessonsToSearchIn) {
        // No search results but we have lessons to filter
        query.lessonId = { $in: lessonsToSearchIn };
      }
    } else if (filteredLessonIds && !query.lessonId) {
      // No search but we have filtered lessons
      query.lessonId = { $in: filteredLessonIds };
    }

    // Validate and sanitize pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));

    // Populate without teacherId (manual populate kerak)
    const assignments = await Assignment.find(query)
      .populate({
        path: 'lessonId',
        populate: [
          { path: 'subjectId', select: 'name' },
          { path: 'classId', select: 'name' }
        ]
      })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .sort({ dueDate: -1 })
      .lean();

    // Manual populate teacher ma'lumotlari
    for (const assignment of assignments) {
      if (assignment.lessonId && assignment.lessonId.teacherId) {
        // teacherId string bo'lishini ta'minlash (object bo'lsa, id fieldini olish)
        let teacherIdValue = assignment.lessonId.teacherId;
        if (typeof teacherIdValue === 'object' && teacherIdValue !== null) {
          teacherIdValue = teacherIdValue.id;
        }
        
        // Faqat string bo'lsa Teacher ni qidirish
        if (teacherIdValue && typeof teacherIdValue === 'string') {
          const teacher = await Teacher.findOne({ id: teacherIdValue })
            .select('id name surname')
            .lean();
          
          assignment.lessonId.teacherId = teacher || { id: teacherIdValue };
        }
      }
    }

    const count = await Assignment.countDocuments(query);

    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
      data: assignments
    });
  } catch (error) {
    console.error('Error in getAllAssignments:', error);
    next(error);
  }
};

// Get Single Assignment
exports.getAssignment = async (req, res, next) => {
  try {
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid assignment ID format'
      });
    }

    const userRole = req.user.role;
    
    // ✅ Assignment ni topish
    const assignment = await Assignment.findById(req.params.id)
      .populate({
        path: 'lessonId',
        populate: [
          { path: 'subjectId', select: 'name' },
          { path: 'classId', select: 'name capacity' }
        ]
      })
      .lean();
    
    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found'
      });
    }

    // ✅ Student rol uchun: assignment o'z classId'siga tegishli ekanligini tekshirish
    if (userRole === 'student') {
      if (!assignment.lessonId || !assignment.lessonId.classId) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to access this assignment'
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
      
      const assignmentClassId = assignment.lessonId.classId._id 
        ? assignment.lessonId.classId._id.toString() 
        : assignment.lessonId.classId.toString();
      
      const studentClassId = req.user.classId._id 
        ? req.user.classId._id.toString() 
        : req.user.classId.toString();
      
      if (assignmentClassId !== studentClassId) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to access this assignment'
        });
      }
    }
    
    // ✅ Parent rol uchun: assignment farzandlarining classId'laridan biriga tegishli ekanligini tekshirish
    if (userRole === 'parent') {
      if (!assignment.lessonId || !assignment.lessonId.classId) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to access this assignment'
        });
      }
      
      const assignmentClassId = assignment.lessonId.classId._id 
        ? assignment.lessonId.classId._id.toString() 
        : assignment.lessonId.classId.toString();
      
      const students = await Student.find({ parentId: req.user.id })
        .select('classId')
        .lean();
      
      const studentClassIds = students
        .map(s => {
          if (!s.classId) return null;
          return s.classId._id ? s.classId._id.toString() : s.classId.toString();
        })
        .filter(id => id);
      
      if (!studentClassIds.includes(assignmentClassId)) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to access this assignment'
        });
      }
    }
    
    // ✅ Teacher role'da bo'lsa, faqat o'ziga tegishli lesson'dagi assignment'larni ko'rish mumkin
    if (userRole === 'teacher') {
      const loggedInTeacherId = req.user.id || req.user._id?.toString();
      
      if (!loggedInTeacherId) {
        return res.status(400).json({
          success: false,
          error: 'Teacher ID not found'
        });
      }

      // Lesson'ning teacherId'sini olish
      if (!assignment.lessonId || !assignment.lessonId.teacherId) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to access this assignment'
        });
      }

      // teacherId ni stringga aylantirish (agar object bo'lsa)
      let lessonTeacherId = assignment.lessonId.teacherId;
      if (typeof lessonTeacherId === 'object' && lessonTeacherId !== null) {
        lessonTeacherId = lessonTeacherId.id;
      }

      // Agar lesson teacher'ga tegishli bo'lmasa, access denied
      if (lessonTeacherId !== loggedInTeacherId) {
        return res.status(403).json({
          success: false,
          error: 'You do not have access to this assignment'
        });
      }
    }

    // Manual populate teacher ma'lumotlari
    if (assignment.lessonId && assignment.lessonId.teacherId) {
      // teacherId string bo'lishini ta'minlash (object bo'lsa, id fieldini olish)
      let teacherIdValue = assignment.lessonId.teacherId;
      if (typeof teacherIdValue === 'object' && teacherIdValue !== null) {
        teacherIdValue = teacherIdValue.id;
      }
      
      // Faqat string bo'lsa Teacher ni qidirish
      if (teacherIdValue && typeof teacherIdValue === 'string') {
        const teacher = await Teacher.findOne({ id: teacherIdValue })
          .select('id name surname email phone')
          .lean();
        
        assignment.lessonId.teacherId = teacher || { id: teacherIdValue };
      }
    }

    res.status(200).json({
      success: true,
      data: assignment
    });
  } catch (error) {
    console.error('Error in getAssignment:', error);
    next(error);
  }
};

// Update Assignment
exports.updateAssignment = async (req, res, next) => {
  try {
    // Validate assignment ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid assignment ID format'
      });
    }

    const { title, startDate, dueDate, lessonId } = req.body;

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

    // Get existing assignment to validate dates properly
    const existingAssignment = await Assignment.findById(req.params.id);
    if (!existingAssignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found'
      });
    }

    // Validate date logic if dates are provided
    const start = startDate ? new Date(startDate) : new Date(existingAssignment.startDate);
    const due = dueDate ? new Date(dueDate) : new Date(existingAssignment.dueDate);
    
    if (isNaN(start.getTime()) || isNaN(due.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format'
      });
    }
    
    if (due <= start) {
      return res.status(400).json({
        success: false,
        error: 'Due date must be after start date'
      });
    }

    // Build update object
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (startDate !== undefined) updateData.startDate = startDate;
    if (dueDate !== undefined) updateData.dueDate = dueDate;
    if (lessonId !== undefined) updateData.lessonId = lessonId;

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    // Update without populate (teacherId ni populate qilmaslik)
    const assignment = await Assignment.findByIdAndUpdate(
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

    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found'
      });
    }

    // Manual populate teacher ma'lumotlari
    if (assignment.lessonId && assignment.lessonId.teacherId) {
      // teacherId string bo'lishini ta'minlash (object bo'lsa, id fieldini olish)
      let teacherIdValue = assignment.lessonId.teacherId;
      if (typeof teacherIdValue === 'object' && teacherIdValue !== null) {
        teacherIdValue = teacherIdValue.id;
      }
      
      // Faqat string bo'lsa Teacher ni qidirish
      if (teacherIdValue && typeof teacherIdValue === 'string') {
        const teacher = await Teacher.findOne({ id: teacherIdValue })
          .select('id name surname email phone')
          .lean();
        
        assignment.lessonId.teacherId = teacher || { id: teacherIdValue };
      }
    }

    res.status(200).json({
      success: true,
      data: assignment
    });
  } catch (error) {
    console.error('Error in updateAssignment:', error);
    
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

// Delete Assignment
exports.deleteAssignment = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid assignment ID format'
      });
    }

    const assignment = await Assignment.findByIdAndDelete(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error in deleteAssignment:', error);
    next(error);
  }
};

