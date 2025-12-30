const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const Lesson = require('../models/Lesson');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

// Create Attendance
exports.createAttendance = async (req, res, next) => {
  try {
    const { date, present, studentId, lessonId } = req.body;

    // Validate studentId
    if (!studentId) {
      return res.status(400).json({
        success: false,
        error: 'Student ID is required'
      });
    }

    // Verify student exists
    const student = await Student.findOne({ id: studentId });
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    // Validate lessonId
    if (!lessonId) {
      return res.status(400).json({
        success: false,
        error: 'Lesson ID is required'
      });
    }

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

    // Validate date
    if (!date) {
      return res.status(400).json({
        success: false,
        error: 'Date is required'
      });
    }

    const attendanceDate = new Date(date);
    if (isNaN(attendanceDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format'
      });
    }

    // Validate present
    if (typeof present !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'Present must be a boolean value'
      });
    }

    // Check if attendance already exists for this student, lesson, and date
    const startOfDay = new Date(attendanceDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(attendanceDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAttendance = await Attendance.findOne({
      studentId,
      lessonId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        error: 'Attendance already exists for this student, lesson, and date'
      });
    }

    // Create attendance
    const attendance = await Attendance.create({
      date: attendanceDate,
      present,
      studentId,
      lessonId
    });

    // Populate attendance with all related data
    const attendanceWithDetails = await Attendance.findById(attendance._id)
      .populate({
        path: 'lessonId',
        populate: [
          { path: 'subjectId', select: 'name' },
          { path: 'classId', select: 'name' }
        ]
      })
      .lean();

    // Manual populate student
    if (attendanceWithDetails.studentId) {
      const studentDetails = await Student.findOne({ id: attendanceWithDetails.studentId })
        .select('id username name surname email')
        .lean();
      
      attendanceWithDetails.student = studentDetails || { id: attendanceWithDetails.studentId };
      delete attendanceWithDetails.studentId;
    }

    // Manual populate teacher
    if (attendanceWithDetails.lessonId && attendanceWithDetails.lessonId.teacherId) {
      const teacher = await Teacher.findOne({ id: attendanceWithDetails.lessonId.teacherId })
        .select('id name surname')
        .lean();
      
      attendanceWithDetails.lessonId.teacherId = teacher || { id: attendanceWithDetails.lessonId.teacherId };
    }

    res.status(201).json({
      success: true,
      data: attendanceWithDetails
    });
  } catch (error) {
    console.error('Error in createAttendance:', error);
    
    // Mongoose validation error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }

    // Duplicate key error (unique index)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Attendance already exists for this student, lesson, and date'
      });
    }
    
    next(error);
  }
};

// Get All Attendances
exports.getAllAttendances = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, studentId, lessonId, date, classId, teacherId, present } = req.query;
    
    let query = {};
    
    // Filter by studentId
    if (studentId) {
      query.studentId = studentId;
    }

    // Filter by lessonId
    if (lessonId) {
      if (!mongoose.Types.ObjectId.isValid(lessonId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid lesson ID format'
        });
      }
      query.lessonId = lessonId;
    }

    // Filter by date
    if (date) {
      const filterDate = new Date(date);
      if (isNaN(filterDate.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid date format'
        });
      }
      // Filter by date (all day)
      const startOfDay = new Date(filterDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(filterDate);
      endOfDay.setHours(23, 59, 59, 999);
      query.date = {
        $gte: startOfDay,
        $lte: endOfDay
      };
    }

    // Filter by present
    if (present !== undefined) {
      if (present === 'true') {
        query.present = true;
      } else if (present === 'false') {
        query.present = false;
      } else {
        return res.status(400).json({
          success: false,
          error: 'Present must be either true or false'
        });
      }
    }

    // Filter by classId or teacherId (requires joining through lesson)
    if (classId || teacherId) {
      let lessonQuery = {};
      
      if (classId) {
        if (!mongoose.Types.ObjectId.isValid(classId)) {
          return res.status(400).json({
            success: false,
            error: 'Invalid class ID format'
          });
        }
        lessonQuery.classId = classId;
      }
      
      if (teacherId) {
        lessonQuery.teacherId = teacherId;
      }

      // Find matching lessons
      const lessons = await Lesson.find(lessonQuery).select('_id').lean();
      const lessonIds = lessons.map(l => l._id);

      if (lessonIds.length === 0) {
        return res.status(200).json({
          success: true,
          count: 0,
          totalPages: 0,
          currentPage: parseInt(page),
          data: []
        });
      }

      // Combine with existing lessonId filter if any
      if (query.lessonId) {
        // If lessonId was already set, check if it's in the filtered lessons
        if (!lessonIds.some(id => id.toString() === query.lessonId.toString())) {
          return res.status(200).json({
            success: true,
            count: 0,
            totalPages: 0,
            currentPage: parseInt(page),
            data: []
          });
        }
      } else {
        query.lessonId = { $in: lessonIds };
      }
    }

    // Validate and sanitize pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));

    // Get attendances
    const attendances = await Attendance.find(query)
      .populate({
        path: 'lessonId',
        populate: [
          { path: 'subjectId', select: 'name' },
          { path: 'classId', select: 'name' }
        ]
      })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .sort({ date: -1 })
      .lean();

    // Manual populate students and teachers
    for (const attendance of attendances) {
      // Populate student
      if (attendance.studentId) {
        const student = await Student.findOne({ id: attendance.studentId })
          .select('id username name surname email')
          .lean();
        
        attendance.student = student || { id: attendance.studentId };
        delete attendance.studentId;
      }

      // Populate teacher
      if (attendance.lessonId && attendance.lessonId.teacherId) {
        const teacher = await Teacher.findOne({ id: attendance.lessonId.teacherId })
          .select('id name surname')
          .lean();
        
        attendance.lessonId.teacherId = teacher || { id: attendance.lessonId.teacherId };
      }
    }

    const count = await Attendance.countDocuments(query);

    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
      data: attendances
    });
  } catch (error) {
    console.error('Error in getAllAttendances:', error);
    next(error);
  }
};

// Get Single Attendance
exports.getAttendance = async (req, res, next) => {
  try {
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid attendance ID format'
      });
    }

    const attendance = await Attendance.findById(req.params.id)
      .populate({
        path: 'lessonId',
        populate: [
          { path: 'subjectId', select: 'name' },
          { path: 'classId', select: 'name capacity' }
        ]
      })
      .lean();
    
    if (!attendance) {
      return res.status(404).json({
        success: false,
        error: 'Attendance not found'
      });
    }

    // Manual populate student
    if (attendance.studentId) {
      const student = await Student.findOne({ id: attendance.studentId })
        .select('id username name surname email phone')
        .lean();
      
      attendance.student = student || { id: attendance.studentId };
      delete attendance.studentId;
    }

    // Manual populate teacher
    if (attendance.lessonId && attendance.lessonId.teacherId) {
      const teacher = await Teacher.findOne({ id: attendance.lessonId.teacherId })
        .select('id name surname email phone')
        .lean();
      
      attendance.lessonId.teacherId = teacher || { id: attendance.lessonId.teacherId };
    }

    res.status(200).json({
      success: true,
      data: attendance
    });
  } catch (error) {
    console.error('Error in getAttendance:', error);
    next(error);
  }
};

// Update Attendance
exports.updateAttendance = async (req, res, next) => {
  try {
    // Validate attendance ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid attendance ID format'
      });
    }

    const { date, present, studentId, lessonId } = req.body;

    // Get existing attendance
    const existingAttendance = await Attendance.findById(req.params.id);
    if (!existingAttendance) {
      return res.status(404).json({
        success: false,
        error: 'Attendance not found'
      });
    }

    // Validate studentId if provided
    if (studentId) {
      const student = await Student.findOne({ id: studentId });
      if (!student) {
        return res.status(404).json({
          success: false,
          error: 'Student not found'
        });
      }
    }

    // Validate lessonId if provided
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

    // Validate date if provided
    if (date !== undefined) {
      const attendanceDate = new Date(date);
      if (isNaN(attendanceDate.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid date format'
        });
      }
    }

    // Validate present if provided
    if (present !== undefined) {
      if (typeof present !== 'boolean') {
        return res.status(400).json({
          success: false,
          error: 'Present must be a boolean value'
        });
      }
    }

    // Build update object
    const updateData = {};
    if (date !== undefined) updateData.date = new Date(date);
    if (present !== undefined) updateData.present = present;
    if (studentId !== undefined) updateData.studentId = studentId;
    if (lessonId !== undefined) updateData.lessonId = lessonId;

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    // Update attendance
    const attendance = await Attendance.findByIdAndUpdate(
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

    if (!attendance) {
      return res.status(404).json({
        success: false,
        error: 'Attendance not found'
      });
    }

    // Manual populate student
    if (attendance.studentId) {
      const student = await Student.findOne({ id: attendance.studentId })
        .select('id username name surname email phone')
        .lean();
      
      attendance.student = student || { id: attendance.studentId };
      delete attendance.studentId;
    }

    // Manual populate teacher
    if (attendance.lessonId && attendance.lessonId.teacherId) {
      const teacher = await Teacher.findOne({ id: attendance.lessonId.teacherId })
        .select('id name surname email phone')
        .lean();
      
      attendance.lessonId.teacherId = teacher || { id: attendance.lessonId.teacherId };
    }

    res.status(200).json({
      success: true,
      data: attendance
    });
  } catch (error) {
    console.error('Error in updateAttendance:', error);
    
    // Mongoose validation error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }

    // Duplicate key error (unique index)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Attendance already exists for this student, lesson, and date'
      });
    }
    
    next(error);
  }
};

// Delete Attendance
exports.deleteAttendance = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid attendance ID format'
      });
    }

    const attendance = await Attendance.findByIdAndDelete(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        error: 'Attendance not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error in deleteAttendance:', error);
    next(error);
  }
};

