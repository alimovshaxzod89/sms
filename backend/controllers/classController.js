const mongoose = require('mongoose');
const Class = require('../models/Class');
const Teacher = require('../models/Teacher');
const Grade = require('../models/Grade');
const Lesson = require('../models/Lesson');

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

// Get All Classes
exports.getAllClasses = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, gradeId, supervisorId } = req.query;
    
    const query = {};
    
    // ✅ Teacher role'da bo'lsa, faqat o'ziga tegishli class'larni ko'rsatish
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

      // Agar teacher'ga tegishli class bo'lmasa, bo'sh array qaytarish
      if (relatedClassIds.length === 0) {
        return res.status(200).json({
          success: true,
          count: 0,
          totalPages: 0,
          currentPage: 1,
          data: []
        });
      }

      // Faqat tegishli class'larni filter qilish
      query._id = { $in: relatedClassIds };
    }
    
    // Sanitize search
    if (search && typeof search === 'string' && search.trim() !== '') {
      const sanitizedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.name = { $regex: sanitizedSearch, $options: 'i' };
    }
    
    // Validate gradeId
    if (gradeId && typeof gradeId === 'string' && gradeId.trim() !== '') {
      if (mongoose.Types.ObjectId.isValid(gradeId)) {
        query.gradeId = gradeId;
      } else {
        return res.status(400).json({
          success: false,
          error: 'Invalid gradeId format'
        });
      }
    }
    
    // ✅ supervisorId - String sifatida qo'shish (admin uchun)
    if (supervisorId && typeof supervisorId === 'string' && supervisorId.trim() !== '') {
      // Teacher bo'lsa, faqat o'z supervisorId'sini filter qilish mumkin
      if (req.user.role === 'teacher') {
        const teacherId = req.user.id || req.user._id?.toString();
        if (supervisorId !== teacherId) {
          return res.status(403).json({
            success: false,
            error: 'You can only filter by your own supervisor ID'
          });
        }
      }
      query.supervisorId = supervisorId.trim();
    }

    // Validate and sanitize pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));

    // ✅ YECHIM 2: populate'siz query
    const classes = await Class.find(query)
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .sort({ createdAt: -1 })
      .lean();

    const count = await Class.countDocuments(query);

    // ✅ Manual populate - supervisorId va gradeId uchun
    const classesWithDetails = await Promise.all(
      classes.map(async (cls) => {
        const classObj = { ...cls };

        // Grade ma'lumotlarini olish
        if (cls.gradeId) {
          const grade = await Grade.findById(cls.gradeId).select('level').lean();
          classObj.gradeId = grade || cls.gradeId;
        }

        // Teacher ma'lumotlarini olish (supervisorId String)
        if (cls.supervisorId) {
          const teacher = await Teacher.findOne({ id: cls.supervisorId })
            .select('name surname')
            .lean();
          classObj.supervisorId = teacher || { id: cls.supervisorId };
        }

        return classObj;
      })
    );

    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
      data: classesWithDetails
    });
  } catch (error) {
    console.error('Error in getAllClasses:', error);
    next(error);
  }
};


// Get Single Class
exports.getClass = async (req, res, next) => {
  try {
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid class ID format'
      });
    }

    const classData = await Class.findById(req.params.id).lean();
    
    if (!classData) {
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }

    // ✅ Teacher role'da bo'lsa, faqat o'ziga tegishli class'larni ko'rish mumkin
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

      // ObjectId'larni string'ga convert qilib taqqoslash
      const relatedClassIdStrings = relatedClassIds.map(id => id.toString());
      const classIdString = classData._id.toString();

      // Agar teacher'ga tegishli bo'lmasa, access denied
      if (!relatedClassIdStrings.includes(classIdString)) {
        return res.status(403).json({
          success: false,
          error: 'You do not have access to this class'
        });
      }
    }

    // ✅ Manual populate
    const classWithDetails = { ...classData };

    // Grade ma'lumotlarini olish
    if (classData.gradeId) {
      const grade = await Grade.findById(classData.gradeId).select('level').lean();
      classWithDetails.gradeId = grade || classData.gradeId;
    }

    // Teacher ma'lumotlarini olish
    if (classData.supervisorId) {
      const teacher = await Teacher.findOne({ id: classData.supervisorId })
        .select('name surname email phone')
        .lean();
      classWithDetails.supervisorId = teacher || { id: classData.supervisorId };
    }

    // ✅ YECHIM: Students ma'lumotlarini olish - _id bo'yicha qidirish
    if (classData.students && classData.students.length > 0) {
      const Student = require('../models/Student');
      const students = await Student.find({ 
        _id: { $in: classData.students } // ✅ id o'rniga _id ishlatish
      })
        .select('name surname id email') // ✅ id field'ini ham qaytarish
        .lean();
      classWithDetails.students = students;
    }

    res.status(200).json({
      success: true,
      data: classWithDetails
    });
  } catch (error) {
    console.error('Error in getClass:', error);
    next(error);
  }
};

// Create Class
exports.createClass = async (req, res, next) => {
  try {
    const { name, capacity, gradeId, supervisorId, students } = req.body;

    // ✅ Validate gradeId
    if (!mongoose.Types.ObjectId.isValid(gradeId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid gradeId format'
      });
    }

    // ✅ Verify grade exists
    const grade = await Grade.findById(gradeId);
    if (!grade) {
      return res.status(404).json({
        success: false,
        error: 'Grade not found'
      });
    }

    // ✅ Verify supervisor exists (if provided) - _id orqali
    let teacherId = null;
    if (supervisorId) {
      // ObjectId formatini tekshirish
      if (!mongoose.Types.ObjectId.isValid(supervisorId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid supervisorId format'
        });
      }

      // Teacher ni _id orqali topish
      const teacher = await Teacher.findById(supervisorId);
      if (!teacher) {
        return res.status(404).json({
          success: false,
          error: 'Supervisor (teacher) not found'
        });
      }
      
      // Teacher ning id fieldini saqlash
      teacherId = teacher.id;
    }

    // ✅ Verify students exist (if provided)
    let validStudents = [];
    if (students && Array.isArray(students) && students.length > 0) {
      const Student = require('../models/Student');
      
      for (const studentId of students) {
        if (mongoose.Types.ObjectId.isValid(studentId)) {
          const student = await Student.findById(studentId);
          if (student) {
            validStudents.push(studentId);
          }
        }
      }
    }

    const classData = await Class.create({
      name,
      capacity,
      gradeId,
      supervisorId: teacherId,
      students: validStudents
    });

    // ✅ Response uchun to'liq ma'lumotlarni qaytarish
    const classWithDetails = await Class.findById(classData._id).lean();

    // Grade ma'lumotlarini olish
    const gradeDetails = await Grade.findById(classData.gradeId)
      .select('level')
      .lean();
    classWithDetails.gradeId = gradeDetails || classData.gradeId;

    // Teacher ma'lumotlarini olish
    if (classData.supervisorId) {
      const teacherDetails = await Teacher.findOne({ id: classData.supervisorId })
        .select('id name surname email phone')
        .lean();
      classWithDetails.supervisorId = teacherDetails || { id: classData.supervisorId };
    }

    // Students ma'lumotlarini olish
    if (validStudents.length > 0) {
      const Student = require('../models/Student');
      const studentDetails = await Student.find({ 
        _id: { $in: validStudents }
      })
        .select('id name surname email')
        .lean();
      classWithDetails.students = studentDetails;
    } else {
      classWithDetails.students = [];
    }

    res.status(201).json({
      success: true,
      data: classWithDetails
    });
  } catch (error) {
    console.error('Error in createClass:', error);
    
    // Mongoose validation error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }
    
    // Duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Class name already exists'
      });
    }
    
    next(error);
  }
};

// Update Class
exports.updateClass = async (req, res, next) => {
  try {
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid class ID format'
      });
    }

    // ✅ Faqat yuborilgan fieldlarni olamiz
    const allowedFields = ['name', 'capacity', 'gradeId', 'supervisorId', 'students'];
    const updateData = {};

    // Har bir field uchun alohida tekshirish
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    // Agar hech narsa o'zgartirilmagan bo'lsa
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    // ✅ gradeId tekshirish
    if (updateData.gradeId !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(updateData.gradeId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid gradeId format'
        });
      }
      
      const grade = await Grade.findById(updateData.gradeId);
      if (!grade) {
        return res.status(404).json({
          success: false,
          error: 'Grade not found'
        });
      }
    }

    // ✅ supervisorId tekshirish - _id (ObjectId) orqali
    if (updateData.supervisorId !== undefined) {
      // Agar null yoki bo'sh string bo'lsa, null qilib qo'yamiz
      if (updateData.supervisorId === null || updateData.supervisorId === '') {
        updateData.supervisorId = null;
      } else {
        // ObjectId formatini tekshirish
        if (!mongoose.Types.ObjectId.isValid(updateData.supervisorId)) {
          return res.status(400).json({
            success: false,
            error: 'Invalid supervisorId format'
          });
        }
        
        // Teacher mavjudligini _id orqali tekshirish
        const teacher = await Teacher.findById(updateData.supervisorId);
        if (!teacher) {
          return res.status(404).json({
            success: false,
            error: 'Supervisor (teacher) not found'
          });
        }
        
        // Teacher.id ni supervisorId sifatida saqlash
        updateData.supervisorId = teacher.id;
      }
    }

    // ✅ students array tekshirish va classId yangilash
    const Student = require('../models/Student');
    let oldStudents = [];
    let newStudents = [];
    
    if (updateData.students !== undefined) {
      // Eski class'ning students ro'yxatini olish
      const existingClass = await Class.findById(req.params.id).lean();
      if (existingClass && existingClass.students) {
        oldStudents = existingClass.students.map(id => id.toString());
      }
      
      // Agar students array bo'lsa va bo'sh bo'lmasa
      if (Array.isArray(updateData.students) && updateData.students.length > 0) {
        // Har bir student ID ni tekshirish
        const validStudents = [];
        
        for (const studentId of updateData.students) {
          if (mongoose.Types.ObjectId.isValid(studentId)) {
            const student = await Student.findById(studentId);
            if (student) {
              validStudents.push(studentId);
            }
          }
        }
        
        updateData.students = validStudents;
        newStudents = validStudents.map(id => id.toString());
      } else if (!Array.isArray(updateData.students)) {
        return res.status(400).json({
          success: false,
          error: 'Students must be an array'
        });
      } else {
        // Agar bo'sh array bo'lsa
        newStudents = [];
      }
    }

    // ✅ Capacity tekshirish
    if (updateData.capacity !== undefined) {
      const capacity = parseInt(updateData.capacity);
      if (isNaN(capacity) || capacity < 1) {
        return res.status(400).json({
          success: false,
          error: 'Capacity must be a positive number'
        });
      }
      updateData.capacity = capacity;
    }

    // ✅ Class ni yangilash
    const classData = await Class.findByIdAndUpdate(
      req.params.id,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    ).lean();

    // ✅ Studentlarning classId propertysini yangilash
    if (updateData.students !== undefined) {
      // Yangi qo'shilgan studentlarning classId'sini yangilash
      const addedStudents = newStudents.filter(id => !oldStudents.includes(id));
      if (addedStudents.length > 0) {
        // ObjectId formatiga o'tkazish
        const addedStudentIds = addedStudents
          .filter(id => mongoose.Types.ObjectId.isValid(id))
          .map(id => new mongoose.Types.ObjectId(id));
        
        if (addedStudentIds.length > 0) {
          await Student.updateMany(
            { _id: { $in: addedStudentIds } },
            { $set: { classId: new mongoose.Types.ObjectId(req.params.id) } }
          );
        }
      }
      
      // Eslatma: Student modelida classId required, shuning uchun 
      // student class'dan olib tashlanganda, uni boshqa class'ga o'tkazish yoki
      // classId'ni yangi class ID'ga o'zgartirish kerak
      // Hozircha faqat yangi qo'shilgan studentlarning classId'sini yangilaymiz
    }

    if (!classData) {
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }

    // ✅ Manual populate - to'liq ma'lumotlarni qaytarish
    const classWithDetails = { ...classData };

    // Grade ma'lumotlarini olish
    if (classData.gradeId) {
      const grade = await Grade.findById(classData.gradeId)
        .select('level')
        .lean();
      classWithDetails.gradeId = grade || classData.gradeId;
    }

    // Teacher ma'lumotlarini olish
    if (classData.supervisorId) {
      const teacher = await Teacher.findOne({ id: classData.supervisorId })
        .select('id name surname email phone')
        .lean();
      classWithDetails.supervisorId = teacher || { id: classData.supervisorId };
    }

    // Students ma'lumotlarini olish
    if (classData.students && classData.students.length > 0) {
      const Student = require('../models/Student');
      const students = await Student.find({ 
        _id: { $in: classData.students }
      })
        .select('id name surname email')
        .lean();
      classWithDetails.students = students;
    } else {
      classWithDetails.students = [];
    }

    res.status(200).json({
      success: true,
      data: classWithDetails
    });
  } catch (error) {
    console.error('Error in updateClass:', error);
    
    // Mongoose validation error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }
    
    // Duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Class name already exists'
      });
    }
    
    next(error);
  }
};

// Delete Class
exports.deleteClass = async (req, res, next) => {
  try {
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid class ID format'
      });
    }

    const classData = await Class.findByIdAndDelete(req.params.id);

    if (!classData) {
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error in deleteClass:', error);
    next(error);
  }
};