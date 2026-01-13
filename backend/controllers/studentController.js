const Student = require('../models/Student');
const Grade = require('../models/Grade');
const Class = require('../models/Class');
const Parent = require('../models/Parent');
const Lesson = require('../models/Lesson');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// ✅ Helper function for checking ownership (student can only access own data)
const checkStudentOwnership = (req, studentId) => {
  if (req.user.role === 'student' && req.user._id.toString() !== studentId) {
    return false;
  }
  return true;
};

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

// Create Student
exports.createStudent = async (req, res, next) => {
  try {
    const { gradeId, classId, parentId } = req.body;

    // Verify related entities exist
    if (gradeId) {
      const grade = await Grade.findById(gradeId);
      if (!grade) {
        return res.status(404).json({
          success: false,
          error: 'Grade not found'
        });
      }
    }

    if (classId) {
      const classData = await Class.findById(classId);
      if (!classData) {
        return res.status(404).json({
          success: false,
          error: 'Class not found'
        });
      }

      // Check class capacity
      const studentsInClass = await Student.countDocuments({ classId });
      if (studentsInClass >= classData.capacity) {
        return res.status(400).json({
          success: false,
          error: 'Class is at full capacity'
        });
      }
    }

    if (parentId) {
      let parent = null;
      
      // ✅ Agar parentId ObjectId formatida bo'lsa (_id), parentni _id orqali topish
      if (mongoose.Types.ObjectId.isValid(parentId)) {
        parent = await Parent.findById(parentId);
      }
      
      // ✅ Agar topilmagan yoki ObjectId emas bo'lsa, id field'i orqali qidirish
      if (!parent) {
        parent = await Parent.findOne({ id: parentId });
      }
      
      if (!parent) {
        return res.status(404).json({
          success: false,
          error: 'Parent not found'
        });
      }
      
      // ✅ Student modelida parentId String type, shuning uchun parent.id ni saqlash
      req.body.parentId = parent.id;
    }

    // Check if username already exists
    const existingStudent = await Student.findOne({ username: req.body.username });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        error: 'Username already exists'
      });
    }

    // Check if email already exists (if provided)
    if (req.body.email) {
      const existingEmail = await Student.findOne({ email: req.body.email });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          error: 'Email already exists'
        });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);

    const student = await Student.create(req.body);

    // Remove password from response
    const studentObject = student.toObject();
    delete studentObject.password;

    res.status(201).json({
      success: true,
      data: studentObject
    });
  } catch (error) {
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        error: `${field} already exists`
      });
    }
    next(error);
  }
};

// Get All Students
exports.getAllStudents = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, classId, gradeId, sex } = req.query;
    
    const query = {};
    
    // ✅ Teacher role'da bo'lsa, faqat o'ziga tegishli studentlarni ko'rsatish
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

      // Faqat tegishli class'lardagi studentlarni filter qilish
      query.classId = { $in: relatedClassIds };
    }
    
    // Search filter
    if (search && typeof search === 'string' && search.trim()) {
      const sanitizedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: { $regex: sanitizedSearch, $options: 'i' } },
        { surname: { $regex: sanitizedSearch, $options: 'i' } },
        { username: { $regex: sanitizedSearch, $options: 'i' } }
      ];
    }
    
    // Class filter (admin yoki teacher o'z class'ini filter qilish uchun)
    if (classId && mongoose.Types.ObjectId.isValid(classId)) {
      // Teacher bo'lsa, faqat o'ziga tegishli class'larni filter qilish mumkin
      if (req.user.role === 'teacher') {
        const teacherId = req.user.id || req.user._id?.toString();
        const relatedClassIds = await getTeacherRelatedClassIds(teacherId);
        
        // ObjectId'larni string'ga convert qilib taqqoslash
        const relatedClassIdStrings = relatedClassIds.map(id => id.toString());
        if (!relatedClassIdStrings.includes(classId)) {
          return res.status(403).json({
            success: false,
            error: 'You do not have access to this class'
          });
        }
      }
      query.classId = classId;
    }
    
    // Grade filter
    if (gradeId && mongoose.Types.ObjectId.isValid(gradeId)) {
      query.gradeId = gradeId;
    }

    // Sex filter
    if (sex && ['male', 'female'].includes(sex.toLowerCase())) {
      query.sex = sex.toLowerCase();
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));

    const students = await Student.find(query)
      .select('-password') // ✅ Exclude password
      .populate('gradeId', 'level name')
      .populate('classId', 'name capacity')
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .sort({ createdAt: -1 })
      .lean();

    const count = await Student.countDocuments(query);

    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
      data: students
    });
  } catch (error) {
    next(error);
  }
};

// Get Single Student
exports.getStudent = async (req, res, next) => {
  try {
    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid student ID format'
      });
    }

    // ✅ Check ownership (students can only view their own profile)
    if (!checkStudentOwnership(req, req.params.id)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this student profile'
      });
    }

    const student = await Student.findById(req.params.id)
      .select('-password')
      .populate('gradeId', 'level name')
      .populate('classId', 'name capacity');
    
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    // ✅ Teacher role'da bo'lsa, faqat o'ziga tegishli studentlarni ko'rish mumkin
    if (req.user.role === 'teacher') {
      const teacherId = req.user.id || req.user._id?.toString();
      
      if (!teacherId) {
        return res.status(400).json({
          success: false,
          error: 'Teacher ID not found'
        });
      }

      // Student'ning class'ini tekshirish
      if (!student.classId) {
        return res.status(403).json({
          success: false,
          error: 'Student does not belong to any class'
        });
      }

      const studentClassId = student.classId._id?.toString() || student.classId.toString();

      // Teacher'ga tegishli class ID'larni olish
      const relatedClassIds = await getTeacherRelatedClassIds(teacherId);

      // ObjectId'larni string'ga convert qilib taqqoslash
      const relatedClassIdStrings = relatedClassIds.map(id => id.toString());
      
      // Agar teacher'ga tegishli bo'lmasa, access denied
      if (!relatedClassIdStrings.includes(studentClassId)) {
        return res.status(403).json({
          success: false,
          error: 'You do not have access to this student'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    next(error);
  }
};

// Update Student
exports.updateStudent = async (req, res, next) => {
  try {
    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid student ID format'
      });
    }

    // ✅ Check ownership (students can only update their own profile)
    if (!checkStudentOwnership(req, req.params.id)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this student profile'
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
      gradeId, 
      classId, 
      parentId 
    } = req.body;

    // ✅ Students cannot change certain fields
    if (req.user.role === 'student') {
      if (gradeId || classId || parentId) {
        return res.status(403).json({
          success: false,
          error: 'Students cannot modify grade, class, or parent information'
        });
      }
    }

    // Verify related entities exist
    if (gradeId) {
      const grade = await Grade.findById(gradeId);
      if (!grade) {
        return res.status(404).json({
          success: false,
          error: 'Grade not found'
        });
      }
    }

    if (classId) {
      const classData = await Class.findById(classId);
      if (!classData) {
        return res.status(404).json({
          success: false,
          error: 'Class not found'
        });
      }

      // Check if changing class and if new class has capacity
      const currentStudent = await Student.findById(req.params.id);
      if (currentStudent && currentStudent.classId && currentStudent.classId.toString() !== classId) {
        const studentsInClass = await Student.countDocuments({ classId });
        if (studentsInClass >= classData.capacity) {
          return res.status(400).json({
            success: false,
            error: 'Class is at full capacity'
          });
        }
      }
    }

    // ✅ parentId ni tekshirish va convert qilish (agar _id bo'lsa, parent.id ga)
    let resolvedParentId = parentId;
    if (parentId) {
      let parent = null;
      
      // ✅ Agar parentId ObjectId formatida bo'lsa (_id), parentni _id orqali topish
      if (mongoose.Types.ObjectId.isValid(parentId)) {
        parent = await Parent.findById(parentId);
      }
      
      // ✅ Agar topilmagan yoki ObjectId emas bo'lsa, id field'i orqali qidirish
      if (!parent) {
        parent = await Parent.findOne({ id: parentId });
      }
      
      if (!parent) {
        return res.status(404).json({
          success: false,
          error: 'Parent not found'
        });
      }
      
      // ✅ Student modelida parentId String type, shuning uchun parent.id ni saqlash
      resolvedParentId = parent.id;
    }

    // Check for duplicate username
    if (username) {
      const existingStudent = await Student.findOne({ 
        username, 
        _id: { $ne: req.params.id } 
      });
      if (existingStudent) {
        return res.status(400).json({
          success: false,
          error: 'Username already exists'
        });
      }
    }

    // Check for duplicate email
    if (email) {
      const existingEmail = await Student.findOne({ 
        email, 
        _id: { $ne: req.params.id } 
      });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          error: 'Email already exists'
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
      sex,
      gradeId,
      classId,
      parentId: resolvedParentId
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );

    // Hash new password if provided
    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    .select('-password')
    .populate('gradeId', 'level name')
    .populate('classId', 'name capacity');

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        error: `${field} already exists`
      });
    }
    next(error);
  }
};

// Delete Student
exports.deleteStudent = async (req, res, next) => {
  try {
    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid student ID format'
      });
    }

    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Student deleted successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};