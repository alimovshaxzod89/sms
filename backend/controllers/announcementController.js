const mongoose = require('mongoose');
const Announcement = require('../models/Announcement');
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

// Create Announcement
exports.createAnnouncement = async (req, res, next) => {
  try {
    const { title, description, date, classId } = req.body;

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

    // Validate date
    if (!date) {
      return res.status(400).json({
        success: false,
        error: 'Date is required'
      });
    }

    // Parse date - support ISO string, DD.MM.YYYY format, and standard Date formats
    let announcementDate;
    if (typeof date === 'string' && date.includes('.')) {
      // Handle DD.MM.YYYY format
      const [day, month, year] = date.split('.');
      announcementDate = new Date(`${year}-${month}-${day}`);
    } else {
      // Handle ISO string or other standard formats
      announcementDate = new Date(date);
    }
    
    if (isNaN(announcementDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format'
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

    // Create announcement
    const announcement = await Announcement.create({
      title: title.trim(),
      description: description.trim(),
      date: announcementDate,
      classId: classId || null
    });

    // Populate announcement with class details
    const announcementWithDetails = await Announcement.findById(announcement._id)
      .populate('classId', 'name capacity')
      .lean();

    res.status(201).json({
      success: true,
      data: announcementWithDetails
    });
  } catch (error) {
    console.error('Error in createAnnouncement:', error);
    
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

// Get All Announcements
exports.getAllAnnouncements = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, classId, startDate, endDate } = req.query;
    
    let query = {};
    
    // ✅ Teacher role'da bo'lsa, announcement'larni filter qilish
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

      // Announcement filter: 
      // 1. classId null bo'lgan announcement'lar (barcha teacherlar uchun)
      // 2. classId teacher'ga tegishli bo'lgan announcement'lar
      query.$or = [
        { classId: null }, // classId bo'lmagan announcement'lar - barcha teacherlar uchun
        { classId: { $in: relatedClassIds } } // Teacher'ga tegishli class'lardagi announcement'lar
      ];
    } else if (req.user.role === 'parent') {
      // ✅ Parent role'da bo'lsa, faqat o'z farzandlarining classId'lariga tegishli announcementlar yoki classId bo'lmagan announcementlar
      const parentId = req.user.id || req.user._id?.toString();
      
      if (!parentId) {
        return res.status(400).json({
          success: false,
          error: 'Parent ID not found'
        });
      }

      // Parent'ga tegishli class ID'larni olish (farzandlarining classId'lari)
      const relatedClassIds = await getParentRelatedClassIds(parentId);

      // Announcement filter:
      // 1. classId null bo'lgan announcement'lar (barcha parentlar uchun)
      // 2. classId parent'ning farzandlarining classId'lariga teng bo'lgan announcement'lar
      query.$or = [
        { classId: null }, // classId bo'lmagan announcement'lar - barcha parentlar uchun
        { classId: { $in: relatedClassIds } } // Parent'ning farzandlarining classId'lariga tegishli announcement'lar
      ];
    } else if (req.user.role === 'student') {
      // ✅ Student role'da bo'lsa, faqat o'z classId'siga tegishli announcementlar yoki classId bo'lmagan announcementlar
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

      // Announcement filter:
      // 1. classId null bo'lgan announcement'lar (barcha studentlar uchun)
      // 2. classId student'ning classId'siga teng bo'lgan announcement'lar
      query.$or = [
        { classId: null }, // classId bo'lmagan announcement'lar - barcha studentlar uchun
        { classId: new mongoose.Types.ObjectId(studentClassIdString) } // Student'ning classId'siga tegishli announcement'lar
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
      query.date = {};
      
      if (startDate) {
        const start = new Date(startDate);
        if (isNaN(start.getTime())) {
          return res.status(400).json({
            success: false,
            error: 'Invalid start date format'
          });
        }
        // Set to start of day
        start.setHours(0, 0, 0, 0);
        query.date.$gte = start;
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
        query.date.$lte = end;
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

    // Get announcements
    const announcements = await Announcement.find(query)
      .populate('classId', 'name capacity')
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .sort({ date: -1 })
      .lean();

    const count = await Announcement.countDocuments(query);

    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
      data: announcements
    });
  } catch (error) {
    console.error('Error in getAllAnnouncements:', error);
    next(error);
  }
};

// Get Single Announcement
exports.getAnnouncement = async (req, res, next) => {
  try {
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid announcement ID format'
      });
    }

    const announcement = await Announcement.findById(req.params.id)
      .populate('classId', 'name capacity')
      .lean();
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        error: 'Announcement not found'
      });
    }

    // ✅ Teacher role'da bo'lsa, announcement'ga access tekshirish
    if (req.user.role === 'teacher') {
      const teacherId = req.user.id || req.user._id?.toString();
      
      if (!teacherId) {
        return res.status(400).json({
          success: false,
          error: 'Teacher ID not found'
        });
      }

      // Agar announcement'da classId bo'lsa, teacher'ga tegishli ekanligini tekshirish
      if (announcement.classId) {
        const announcementClassId = announcement.classId._id?.toString() || announcement.classId.toString();
        
        // Teacher'ga tegishli class ID'larni olish
        const relatedClassIds = await getTeacherRelatedClassIds(teacherId);
        const relatedClassIdStrings = relatedClassIds.map(id => id.toString());

        // Agar announcement'ning classId'si teacher'ga tegishli bo'lmasa, access denied
        if (!relatedClassIdStrings.includes(announcementClassId)) {
          return res.status(403).json({
            success: false,
            error: 'You do not have access to this announcement'
          });
        }
      }
      // Agar announcement'da classId bo'lmasa (null), barcha teacherlar ko'ra oladi - hech narsa qilmaymiz
    } else if (req.user.role === 'parent') {
      // ✅ Parent role'da bo'lsa, announcement'ga access tekshirish
      const parentId = req.user.id || req.user._id?.toString();
      
      if (!parentId) {
        return res.status(400).json({
          success: false,
          error: 'Parent ID not found'
        });
      }

      // Agar announcement'da classId bo'lsa, parent'ning farzandlarining classId'lariga tegishli ekanligini tekshirish
      if (announcement.classId) {
        const announcementClassId = announcement.classId._id?.toString() || announcement.classId.toString();
        
        // Parent'ga tegishli class ID'larni olish (farzandlarining classId'lari)
        const relatedClassIds = await getParentRelatedClassIds(parentId);
        const relatedClassIdStrings = relatedClassIds.map(id => id.toString());

        // Agar announcement'ning classId'si parent'ning farzandlarining classId'lariga tegishli bo'lmasa, access denied
        if (!relatedClassIdStrings.includes(announcementClassId)) {
          return res.status(403).json({
            success: false,
            error: 'You do not have access to this announcement'
          });
        }
      }
      // Agar announcement'da classId bo'lmasa (null), barcha parentlar ko'ra oladi - hech narsa qilmaymiz
    } else if (req.user.role === 'student') {
      // ✅ Student role'da bo'lsa, announcement'ga access tekshirish
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

      // Agar announcement'da classId bo'lsa, student'ning classId'siga teng ekanligini tekshirish
      if (announcement.classId) {
        const announcementClassId = announcement.classId._id?.toString() || announcement.classId.toString();
        
        // Agar announcement'ning classId'si student'ning classId'siga teng bo'lmasa, access denied
        if (announcementClassId !== studentClassIdString) {
          return res.status(403).json({
            success: false,
            error: 'You do not have access to this announcement'
          });
        }
      }
      // Agar announcement'da classId bo'lmasa (null), barcha studentlar ko'ra oladi - hech narsa qilmaymiz
    }

    res.status(200).json({
      success: true,
      data: announcement
    });
  } catch (error) {
    console.error('Error in getAnnouncement:', error);
    next(error);
  }
};

// Update Announcement
exports.updateAnnouncement = async (req, res, next) => {
  try {
    // Validate announcement ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid announcement ID format'
      });
    }

    const { title, description, date, classId } = req.body;

    // Get existing announcement
    const existingAnnouncement = await Announcement.findById(req.params.id);
    if (!existingAnnouncement) {
      return res.status(404).json({
        success: false,
        error: 'Announcement not found'
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

    // Validate date if provided
    if (date !== undefined) {
      // Parse date - support ISO string, DD.MM.YYYY format, and standard Date formats
      let announcementDate;
      if (typeof date === 'string' && date.includes('.')) {
        // Handle DD.MM.YYYY format
        const [day, month, year] = date.split('.');
        announcementDate = new Date(`${year}-${month}-${day}`);
      } else {
        // Handle ISO string or other standard formats
        announcementDate = new Date(date);
      }
      
      if (isNaN(announcementDate.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid date format'
        });
      }
      updateData.date = announcementDate;
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

    // Update announcement
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('classId', 'name capacity')
    .lean();

    if (!announcement) {
      return res.status(404).json({
        success: false,
        error: 'Announcement not found'
      });
    }

    res.status(200).json({
      success: true,
      data: announcement
    });
  } catch (error) {
    console.error('Error in updateAnnouncement:', error);
    
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

// Delete Announcement
exports.deleteAnnouncement = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid announcement ID format'
      });
    }

    const announcement = await Announcement.findByIdAndDelete(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        error: 'Announcement not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error in deleteAnnouncement:', error);
    next(error);
  }
};

