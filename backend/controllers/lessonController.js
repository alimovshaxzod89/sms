const Lesson = require('../models/Lesson');
const Class = require('../models/Class');
const Teacher = require('../models/Teacher');
const Subject = require('../models/Subject');
const mongoose = require('mongoose');

// Create Lesson
exports.createLesson = async (req, res, next) => {
  try {
    const { name, teacherId, subjectId, classId, day, startTime, endTime } = req.body;

    // ✅ teacherId uchun ObjectId format tekshirish (Teacher _id yuboriladi)
    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid teacher ID format'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid subject ID format'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid class ID format'
      });
    }

    // ✅ Verify related entities exist
    const [teacher, subject, classData] = await Promise.all([
      Teacher.findById(teacherId),  // _id orqali topish
      Subject.findById(subjectId),
      Class.findById(classId)
    ]);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        error: 'Teacher not found'
      });
    }

    if (!subject) {
      return res.status(404).json({
        success: false,
        error: 'Subject not found'
      });
    }

    if (!classData) {
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }

    // Validate day, startTime, endTime (optional fields)
    // Agar bittasi ham berilgan bo'lsa, barchasi bo'lishi kerak
    const hasScheduleFields = day || startTime || endTime;
    if (hasScheduleFields) {
      if (!day || !startTime || !endTime) {
        return res.status(400).json({
          success: false,
          error: 'If providing schedule information, please provide day, startTime, and endTime'
        });
      }

      const validDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
      if (!validDays.includes(day.toUpperCase())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid day. Must be one of: MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY'
        });
      }

      // Validate time format (HH:MM)
      const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(startTime)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid startTime format. Use HH:MM format (e.g., 08:00)'
        });
      }

      if (!timeRegex.test(endTime)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid endTime format. Use HH:MM format (e.g., 09:00)'
        });
      }

      // Validate that endTime is after startTime
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      const startTotalMinutes = startHours * 60 + startMinutes;
      const endTotalMinutes = endHours * 60 + endMinutes;

      if (endTotalMinutes <= startTotalMinutes) {
        return res.status(400).json({
          success: false,
          error: 'endTime must be after startTime'
        });
      }
    }

    // Check if lesson with same name already exists for this class
    const existingLesson = await Lesson.findOne({
      name,
      classId
    });

    if (existingLesson) {
      return res.status(400).json({
        success: false,
        error: 'A lesson with this name already exists for this class'
      });
    }

    // ✅ Teacher ning id fieldini saqlash (String)
    // Build lesson object with optional schedule fields
    const lessonData = {
      name,
      teacherId: teacher.id,  // String type
      subjectId,
      classId
    };

    // Add schedule fields only if provided
    if (hasScheduleFields) {
      lessonData.day = day.toUpperCase();
      lessonData.startTime = startTime;
      lessonData.endTime = endTime;
    }

    const lesson = await Lesson.create(lessonData);

    // ✅ Populate the response
    const populatedLesson = await Lesson.findById(lesson._id)
      .populate('subjectId', 'name')
      .populate('classId', 'name')
      .lean();

    // ✅ Manual populate teacher
    const teacherData = await Teacher.findOne({ id: populatedLesson.teacherId })
      .select('id name surname')
      .lean();
    
    populatedLesson.teacherId = teacherData || { id: populatedLesson.teacherId };

    res.status(201).json({
      success: true,
      data: populatedLesson
    });
  } catch (error) {
    console.error('Error in createLesson:', error);
    
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

// Get All Lessons
exports.getAllLessons = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, classId, teacherId } = req.query;
    
    const query = {};
    
    // ✅ Teacher role'da bo'lsa, faqat o'ziga tegishli lesson'larni ko'rsatish
    if (req.user.role === 'teacher') {
      const loggedInTeacherId = req.user.id || req.user._id?.toString();
      
      if (!loggedInTeacherId) {
        return res.status(400).json({
          success: false,
          error: 'Teacher ID not found'
        });
      }

      // Faqat o'sha teacher'ning lesson'larini filter qilish
      query.teacherId = loggedInTeacherId;
    } else if (teacherId) {
      // Admin uchun teacherId filter (query parameter orqali)
      query.teacherId = teacherId;
    }
    
    // Sanitize search parameter
    if (search && typeof search === 'string') {
      const sanitizedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.name = { $regex: sanitizedSearch, $options: 'i' };
    }
    
    // Validate MongoDB ObjectIds
    if (classId) {
      if (!mongoose.Types.ObjectId.isValid(classId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid class ID format'
        });
      }
      query.classId = classId;
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));

    // ✅ Populate without teacherId
    const lessons = await Lesson.find(query)
      .populate('subjectId', 'name')
      .populate('classId', 'name')
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .sort({ createdAt: -1 })
      .lean();

    // ✅ Manual populate teachers
    const teacherIds = [...new Set(lessons.map(l => l.teacherId).filter(Boolean))];
    const teachers = await Teacher.find({ id: { $in: teacherIds } })
      .select('id name surname')
      .lean();
    
    const teacherMap = {};
    teachers.forEach(t => {
      teacherMap[t.id] = t;
    });
    
    lessons.forEach(lesson => {
      if (lesson.teacherId) {
        lesson.teacherId = teacherMap[lesson.teacherId] || { id: lesson.teacherId };
      }
    });

    const count = await Lesson.countDocuments(query);

    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
      data: lessons
    });
  } catch (error) {
    console.error('Error in getAllLessons:', error);
    next(error);
  }
};

// Get Single Lesson
exports.getLesson = async (req, res, next) => {
  try {
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid lesson ID format'
      });
    }

    // ✅ Populate without teacherId
    const lesson = await Lesson.findById(req.params.id)
      .populate('subjectId', 'name')
      .populate('classId', 'name capacity')
      .lean();
    
    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: 'Lesson not found'
      });
    }

    // ✅ Teacher role'da bo'lsa, faqat o'ziga tegishli lesson'larni ko'rish mumkin
    if (req.user.role === 'teacher') {
      const loggedInTeacherId = req.user.id || req.user._id?.toString();
      
      if (!loggedInTeacherId) {
        return res.status(400).json({
          success: false,
          error: 'Teacher ID not found'
        });
      }

      // Agar lesson teacher'ga tegishli bo'lmasa, access denied
      if (lesson.teacherId !== loggedInTeacherId) {
        return res.status(403).json({
          success: false,
          error: 'You do not have access to this lesson'
        });
      }
    }

    // ✅ Manual populate teacher
    if (lesson.teacherId) {
      const teacher = await Teacher.findOne({ id: lesson.teacherId })
        .select('id name surname email phone')
        .lean();
      
      lesson.teacherId = teacher || { id: lesson.teacherId };
    }

    res.status(200).json({
      success: true,
      data: lesson
    });
  } catch (error) {
    console.error('Error in getLesson:', error);
    next(error);
  }
};

// Update Lesson
exports.updateLesson = async (req, res, next) => {
  try {
    // Validate lesson ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid lesson ID format'
      });
    }

    const { name, teacherId, subjectId, classId, day, startTime, endTime } = req.body;

    // Build update object
    const updateData = {};
    
    // ✅ Verify teacher exists if teacherId is being updated
    if (teacherId !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(teacherId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid teacher ID format'
        });
      }
      
      const teacher = await Teacher.findById(teacherId);
      if (!teacher) {
        return res.status(404).json({
          success: false,
          error: 'Teacher not found'
        });
      }
      
      updateData.teacherId = teacher.id;  // String type
    }

    if (subjectId !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(subjectId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid subject ID format'
        });
      }
      
      const subject = await Subject.findById(subjectId);
      if (!subject) {
        return res.status(404).json({
          success: false,
          error: 'Subject not found'
        });
      }
      
      updateData.subjectId = subjectId;
    }

    if (classId !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(classId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid class ID format'
        });
      }
      
      const classData = await Class.findById(classId);
      if (!classData) {
        return res.status(404).json({
          success: false,
          error: 'Class not found'
        });
      }
      
      updateData.classId = classId;
    }

    if (name !== undefined) {
      updateData.name = name;
    }

    // Validate and update day
    if (day !== undefined) {
      const validDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
      if (!validDays.includes(day.toUpperCase())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid day. Must be one of: MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY'
        });
      }
      updateData.day = day.toUpperCase();
    }

    // Validate and update startTime
    if (startTime !== undefined) {
      const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(startTime)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid startTime format. Use HH:MM format (e.g., 08:00)'
        });
      }
      updateData.startTime = startTime;
    }

    // Validate and update endTime
    if (endTime !== undefined) {
      const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(endTime)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid endTime format. Use HH:MM format (e.g., 09:00)'
        });
      }
      updateData.endTime = endTime;
    }

    // Validate that endTime is after startTime (if both are being updated)
    if (updateData.startTime !== undefined || updateData.endTime !== undefined) {
      // Get current lesson to compare times
      const currentLesson = await Lesson.findById(req.params.id).lean();
      if (currentLesson) {
        const finalStartTime = updateData.startTime || currentLesson.startTime;
        const finalEndTime = updateData.endTime || currentLesson.endTime;

        const [startHours, startMinutes] = finalStartTime.split(':').map(Number);
        const [endHours, endMinutes] = finalEndTime.split(':').map(Number);
        const startTotalMinutes = startHours * 60 + startMinutes;
        const endTotalMinutes = endHours * 60 + endMinutes;

        if (endTotalMinutes <= startTotalMinutes) {
          return res.status(400).json({
            success: false,
            error: 'endTime must be after startTime'
          });
        }
      }
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    // ✅ Update without populate teacherId
    const lesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('subjectId', 'name')
      .populate('classId', 'name')
      .lean();

    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: 'Lesson not found'
      });
    }

    // ✅ Manual populate teacher
    if (lesson.teacherId) {
      const teacher = await Teacher.findOne({ id: lesson.teacherId })
        .select('id name surname')
        .lean();
      
      lesson.teacherId = teacher || { id: lesson.teacherId };
    }

    res.status(200).json({
      success: true,
      data: lesson
    });
  } catch (error) {
    console.error('Error in updateLesson:', error);
    
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

// Delete Lesson
exports.deleteLesson = async (req, res, next) => {
  try {
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid lesson ID format'
      });
    }

    const lesson = await Lesson.findByIdAndDelete(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: 'Lesson not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {},
      message: 'Lesson deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteLesson:', error);
    next(error);
  }
};