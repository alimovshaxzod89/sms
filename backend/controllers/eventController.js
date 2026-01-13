const mongoose = require('mongoose');
const Event = require('../models/Event');
const Class = require('../models/Class');
const Lesson = require('../models/Lesson');
const Student = require('../models/Student');
const Parent = require('../models/Parent');

// ✅ Helper function to get teacher's related class IDs (as ObjectIds)
const getTeacherRelatedClassIds = async (teacherId) => {
  // 1. Teacher'ning supervisor bo'lgan class'larni topish
  const supervisedClasses = await Class.find({ supervisorId: teacherId })
    .select('_id')
    .lean();
  const supervisedClassIds = supervisedClasses.map(cls => cls._id);

  // 2. Teacher'ning dars berayotgan class'larni topish (Lesson orqali)
  const teacherLessons = await Lesson.find({ teacherId: teacherId })
    .select('classId')
    .lean();
  const lessonClassIds = teacherLessons.map(lesson => lesson.classId);

  // 3. Barcha tegishli class ID'larni birlashtirish (unique qilish)
  // ObjectId'larni string'ga convert qilib, keyin yana ObjectId'ga convert qilamiz
  const uniqueClassIdStrings = [...new Set([
    ...supervisedClassIds.map(id => id.toString()),
    ...lessonClassIds.map(id => id.toString())
  ])];
  
  // ObjectId formatiga qaytarish
  return uniqueClassIdStrings
    .filter(id => mongoose.Types.ObjectId.isValid(id))
    .map(id => new mongoose.Types.ObjectId(id));
};

// ✅ Helper function to get parent's related class IDs (as ObjectIds)
const getParentRelatedClassIds = async (parentId) => {
  // Parent'ning farzandlarini topish
  let parent;
  
  // Parent'ni topish (_id yoki id field orqali)
  if (mongoose.Types.ObjectId.isValid(parentId)) {
    parent = await Parent.findById(parentId).select('id').lean();
  }
  
  if (!parent) {
    parent = await Parent.findOne({ id: parentId }).select('id').lean();
  }
  
  if (!parent) {
    return [];
  }
  
  // Parent'ning farzandlarini topish (parentId orqali)
  const students = await Student.find({ parentId: parent.id || parentId })
    .select('classId')
    .lean();
  
  // Farzandlarining classId'larini olish (unique qilish)
  const classIdStrings = [...new Set(
    students
      .filter(student => student.classId)
      .map(student => student.classId.toString())
  )];
  
  // ObjectId formatiga qaytarish
  return classIdStrings
    .filter(id => mongoose.Types.ObjectId.isValid(id))
    .map(id => new mongoose.Types.ObjectId(id));
};

// Create Event
exports.createEvent = async (req, res, next) => {
  try {
    const { title, description, startTime, endTime, classId } = req.body;

    // Validate title
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Title is required'
      });
    }

    // Validate description
    if (!description || typeof description !== 'string' || description.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Description is required'
      });
    }

    // Validate startTime and endTime
    if (!startTime || !endTime) {
      return res.status(400).json({
        success: false,
        error: 'Start time and end time are required'
      });
    }

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

    // Validate classId if provided
    if (classId) {
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
    }

    // Create event
    const event = await Event.create({
      title: title.trim(),
      description: description.trim(),
      startTime: start,
      endTime: end,
      classId: classId || null
    });

    // Populate event with class details
    const eventWithDetails = await Event.findById(event._id)
      .populate('classId', 'name capacity')
      .lean();

    res.status(201).json({
      success: true,
      data: eventWithDetails
    });
  } catch (error) {
    console.error('Error in createEvent:', error);
    
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

// Get All Events
exports.getAllEvents = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, classId, startDate, endDate } = req.query;
    
    let query = {};
    
    // ✅ Teacher role'da bo'lsa, event'larni filter qilish
    if (req.user.role === 'teacher') {
      const teacherId = req.user.id || req.user._id?.toString();
      
      if (!teacherId) {
        return res.status(400).json({
          success: false,
          error: 'Teacher ID not found'
        });
      }

      // Teacher'ga tegishli class ID'larni olish
      const relatedClassIds = await getTeacherRelatedClassIds(teacherId);
      const relatedClassIdStrings = relatedClassIds.map(id => id.toString());

      // Event filter: 
      // 1. classId null bo'lgan event'lar (barcha teacherlar uchun)
      // 2. classId teacher'ga tegishli bo'lgan event'lar
      query.$or = [
        { classId: null }, // classId bo'lmagan event'lar - barcha teacherlar uchun
        { classId: { $in: relatedClassIds } } // Teacher'ga tegishli class'lardagi event'lar
      ];
    } else if (req.user.role === 'parent') {
      // ✅ Parent role'da bo'lsa, faqat o'z farzandlarining classId'lariga tegishli eventlar yoki classId bo'lmagan eventlar
      const parentId = req.user.id || req.user._id?.toString();
      
      if (!parentId) {
        return res.status(400).json({
          success: false,
          error: 'Parent ID not found'
        });
      }

      // Parent'ga tegishli class ID'larni olish (farzandlarining classId'lari)
      const relatedClassIds = await getParentRelatedClassIds(parentId);

      // Event filter:
      // 1. classId null bo'lgan event'lar (barcha parentlar uchun)
      // 2. classId parent'ning farzandlarining classId'lariga teng bo'lgan event'lar
      query.$or = [
        { classId: null }, // classId bo'lmagan event'lar - barcha parentlar uchun
        { classId: { $in: relatedClassIds } } // Parent'ning farzandlarining classId'lariga tegishli event'lar
      ];
    } else if (req.user.role === 'student') {
      // ✅ Student role'da bo'lsa, faqat o'z classId'siga tegishli eventlar yoki classId bo'lmagan eventlar
      const studentId = req.user.id || req.user._id?.toString();
      
      if (!studentId) {
        return res.status(400).json({
          success: false,
          error: 'Student ID not found'
        });
      }

      // Student'ning classId'sini olish
      let studentClassId = req.user.classId;
      
      // Agar req.user'da classId bo'lmasa, Student'ni qaytadan yuklash
      if (!studentClassId) {
        const student = await Student.findById(studentId)
          .select('classId')
          .lean();
        
        if (!student || !student.classId) {
          return res.status(400).json({
            success: false,
            error: 'Student class not found'
          });
        }
        
        studentClassId = student.classId;
      }

      // classId ObjectId yoki string formatida bo'lishi mumkin
      const studentClassIdString = studentClassId._id 
        ? studentClassId._id.toString() 
        : studentClassId.toString();

      if (!mongoose.Types.ObjectId.isValid(studentClassIdString)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid student class ID format'
        });
      }

      // Event filter:
      // 1. classId null bo'lgan event'lar (barcha studentlar uchun)
      // 2. classId student'ning classId'siga teng bo'lgan event'lar
      query.$or = [
        { classId: null }, // classId bo'lmagan event'lar - barcha studentlar uchun
        { classId: new mongoose.Types.ObjectId(studentClassIdString) } // Student'ning classId'siga tegishli event'lar
      ];
    } else {
      // Admin va boshqa rollar uchun - classId filter (query parametrdan)
      if (classId) {
        if (!mongoose.Types.ObjectId.isValid(classId)) {
          return res.status(400).json({
            success: false,
            error: 'Invalid class ID format'
          });
        }
        query.classId = classId;
      }
    }

    // Filter by date range
    if (startDate || endDate) {
      query.startTime = {};
      
      if (startDate) {
        const start = new Date(startDate);
        if (isNaN(start.getTime())) {
          return res.status(400).json({
            success: false,
            error: 'Invalid start date format'
          });
        }
        query.startTime.$gte = start;
      }

      if (endDate) {
        const end = new Date(endDate);
        if (isNaN(end.getTime())) {
          return res.status(400).json({
            success: false,
            error: 'Invalid end date format'
          });
        }
        // Set to end of day
        end.setHours(23, 59, 59, 999);
        query.startTime.$lte = end;
      }
    }

    // Search by title or description
    if (search && typeof search === 'string') {
      const sanitizedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchOr = [
        { title: { $regex: sanitizedSearch, $options: 'i' } },
        { description: { $regex: sanitizedSearch, $options: 'i' } }
      ];

      // Agar teacher filter ($or) mavjud bo'lsa, $and bilan birlashtirish
      if (query.$or) {
        query.$and = [
          { $or: query.$or },
          { $or: searchOr }
        ];
        delete query.$or;
      } else {
        query.$or = searchOr;
      }
    }

    // Validate and sanitize pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));

    // Get events
    const events = await Event.find(query)
      .populate('classId', 'name capacity')
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .sort({ startTime: -1 })
      .lean();

    const count = await Event.countDocuments(query);

    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
      data: events
    });
  } catch (error) {
    console.error('Error in getAllEvents:', error);
    next(error);
  }
};

// Get Single Event
exports.getEvent = async (req, res, next) => {
  try {
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid event ID format'
      });
    }

    const event = await Event.findById(req.params.id)
      .populate('classId', 'name capacity')
      .lean();
    
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    // ✅ Teacher role'da bo'lsa, event'ga access tekshirish
    if (req.user.role === 'teacher') {
      const teacherId = req.user.id || req.user._id?.toString();
      
      if (!teacherId) {
        return res.status(400).json({
          success: false,
          error: 'Teacher ID not found'
        });
      }

      // Agar event'da classId bo'lsa, teacher'ga tegishli ekanligini tekshirish
      if (event.classId) {
        const eventClassId = event.classId._id?.toString() || event.classId.toString();
        
        // Teacher'ga tegishli class ID'larni olish
        const relatedClassIds = await getTeacherRelatedClassIds(teacherId);
        const relatedClassIdStrings = relatedClassIds.map(id => id.toString());

        // Agar event'ning classId'si teacher'ga tegishli bo'lmasa, access denied
        if (!relatedClassIdStrings.includes(eventClassId)) {
          return res.status(403).json({
            success: false,
            error: 'You do not have access to this event'
          });
        }
      }
      // Agar event'da classId bo'lmasa (null), barcha teacherlar ko'ra oladi - hech narsa qilmaymiz
    } else if (req.user.role === 'parent') {
      // ✅ Parent role'da bo'lsa, event'ga access tekshirish
      const parentId = req.user.id || req.user._id?.toString();
      
      if (!parentId) {
        return res.status(400).json({
          success: false,
          error: 'Parent ID not found'
        });
      }

      // Agar event'da classId bo'lsa, parent'ning farzandlarining classId'lariga tegishli ekanligini tekshirish
      if (event.classId) {
        const eventClassId = event.classId._id?.toString() || event.classId.toString();
        
        // Parent'ga tegishli class ID'larni olish (farzandlarining classId'lari)
        const relatedClassIds = await getParentRelatedClassIds(parentId);
        const relatedClassIdStrings = relatedClassIds.map(id => id.toString());

        // Agar event'ning classId'si parent'ning farzandlarining classId'lariga tegishli bo'lmasa, access denied
        if (!relatedClassIdStrings.includes(eventClassId)) {
          return res.status(403).json({
            success: false,
            error: 'You do not have access to this event'
          });
        }
      }
      // Agar event'da classId bo'lmasa (null), barcha parentlar ko'ra oladi - hech narsa qilmaymiz
    } else if (req.user.role === 'student') {
      // ✅ Student role'da bo'lsa, event'ga access tekshirish
      const studentId = req.user.id || req.user._id?.toString();
      
      if (!studentId) {
        return res.status(400).json({
          success: false,
          error: 'Student ID not found'
        });
      }

      // Student'ning classId'sini olish
      let studentClassId = req.user.classId;
      
      // Agar req.user'da classId bo'lmasa, Student'ni qaytadan yuklash
      if (!studentClassId) {
        const student = await Student.findById(studentId)
          .select('classId')
          .lean();
        
        if (!student || !student.classId) {
          return res.status(400).json({
            success: false,
            error: 'Student class not found'
          });
        }
        
        studentClassId = student.classId;
      }

      // classId ObjectId yoki string formatida bo'lishi mumkin
      const studentClassIdString = studentClassId._id 
        ? studentClassId._id.toString() 
        : studentClassId.toString();

      // Agar event'da classId bo'lsa, student'ning classId'siga teng ekanligini tekshirish
      if (event.classId) {
        const eventClassId = event.classId._id?.toString() || event.classId.toString();
        
        // Agar event'ning classId'si student'ning classId'siga teng bo'lmasa, access denied
        if (eventClassId !== studentClassIdString) {
          return res.status(403).json({
            success: false,
            error: 'You do not have access to this event'
          });
        }
      }
      // Agar event'da classId bo'lmasa (null), barcha studentlar ko'ra oladi - hech narsa qilmaymiz
    }

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Error in getEvent:', error);
    next(error);
  }
};

// Update Event
exports.updateEvent = async (req, res, next) => {
  try {
    // Validate event ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid event ID format'
      });
    }

    const { title, description, startTime, endTime, classId } = req.body;

    // Get existing event
    const existingEvent = await Event.findById(req.params.id);
    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    // Build update object
    const updateData = {};

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'Title cannot be empty'
        });
      }
      updateData.title = title.trim();
    }

    if (description !== undefined) {
      if (typeof description !== 'string' || description.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'Description cannot be empty'
        });
      }
      updateData.description = description.trim();
    }

    // Validate time logic if both times are provided
    if (startTime !== undefined && endTime !== undefined) {
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

      updateData.startTime = start;
      updateData.endTime = end;
    } else if (startTime !== undefined) {
      // Only startTime provided, need to validate against existing endTime
      const start = new Date(startTime);
      if (isNaN(start.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid start time format'
        });
      }

      const existingEndTime = new Date(existingEvent.endTime);
      if (start >= existingEndTime) {
        return res.status(400).json({
          success: false,
          error: 'Start time must be before end time'
        });
      }

      updateData.startTime = start;
    } else if (endTime !== undefined) {
      // Only endTime provided, need to validate against existing startTime
      const end = new Date(endTime);
      if (isNaN(end.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid end time format'
        });
      }

      const existingStartTime = new Date(existingEvent.startTime);
      if (existingStartTime >= end) {
        return res.status(400).json({
          success: false,
          error: 'End time must be after start time'
        });
      }

      updateData.endTime = end;
    }

    // Validate classId if provided
    if (classId !== undefined) {
      if (classId === null || classId === '') {
        updateData.classId = null;
      } else {
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
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    // Update event
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('classId', 'name capacity')
    .lean();

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Error in updateEvent:', error);
    
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

// Delete Event
exports.deleteEvent = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid event ID format'
      });
    }

    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error in deleteEvent:', error);
    next(error);
  }
};

