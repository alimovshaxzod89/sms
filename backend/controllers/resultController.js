const mongoose = require('mongoose');
const Result = require('../models/Result');
const Exam = require('../models/Exam');
const Assignment = require('../models/Assignment');
const Student = require('../models/Student');
const Lesson = require('../models/Lesson');
const Teacher = require('../models/Teacher');
const Subject = require('../models/Subject');

// Create Result
exports.createResult = async (req, res, next) => {
  try {
    const { score, examId, assignmentId, studentId } = req.body;

    // Validate: examId va assignmentId'ning bittasi bo'lishi kerak
    if (!examId && !assignmentId) {
      return res.status(400).json({
        success: false,
        error: 'Either examId or assignmentId must be provided'
      });
    }

    // Validate: ikkalasi ham bo'lmashi kerak
    if (examId && assignmentId) {
      return res.status(400).json({
        success: false,
        error: 'Result cannot be associated with both exam and assignment. Please provide only one.'
      });
    }

    // Validate studentId
    if (!studentId) {
      return res.status(400).json({
        success: false,
        error: 'Student ID is required'
      });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid student ID format'
      });
    }

    // Verify student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }

    // Validate score
    if (score === undefined || score === null) {
      return res.status(400).json({
        success: false,
        error: 'Score is required'
      });
    }

    if (typeof score !== 'number' || score < 0 || score > 100) {
      return res.status(400).json({
        success: false,
        error: 'Score must be a number between 0 and 100'
      });
    }

    // Verify exam or assignment exists
    if (examId) {
      if (!mongoose.Types.ObjectId.isValid(examId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid exam ID format'
        });
      }

      const exam = await Exam.findById(examId);
      if (!exam) {
        return res.status(404).json({
          success: false,
          error: 'Exam not found'
        });
      }

      // Check if result already exists for this student and exam
      const existingResult = await Result.findOne({ examId, studentId });
      if (existingResult) {
        return res.status(400).json({
          success: false,
          error: 'Result already exists for this student and exam'
        });
      }
    }

    if (assignmentId) {
      if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid assignment ID format'
        });
      }

      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) {
        return res.status(404).json({
          success: false,
          error: 'Assignment not found'
        });
      }

      // Check if result already exists for this student and assignment
      const existingResult = await Result.findOne({ assignmentId, studentId });
      if (existingResult) {
        return res.status(400).json({
          success: false,
          error: 'Result already exists for this student and assignment'
        });
      }
    }

    // Create result
    const resultData = {
      score,
      studentId,
      examId: examId || null,
      assignmentId: assignmentId || null
    };

    const result = await Result.create(resultData);

    // Populate result with all related data
    const resultWithDetails = await Result.findById(result._id)
      .populate('examId')
      .populate('assignmentId')
      .lean();

    // Populate student - backward compatibility: support both ObjectId and String (id field)
    if (resultWithDetails.studentId) {
      let studentDetails = null;
      
      // Try ObjectId first (new format)
      if (mongoose.Types.ObjectId.isValid(resultWithDetails.studentId)) {
        studentDetails = await Student.findById(resultWithDetails.studentId)
          .select('id username name surname email')
          .lean();
      }
      
      // If not found, try String id field (old format)
      if (!studentDetails) {
        studentDetails = await Student.findOne({ id: resultWithDetails.studentId })
          .select('id username name surname email')
          .lean();
      }
      
      resultWithDetails.student = studentDetails || { _id: resultWithDetails.studentId };
      delete resultWithDetails.studentId;
    }

    // If exam exists, populate exam details
    if (resultWithDetails.examId) {
      const examDetails = await Exam.findById(resultWithDetails.examId)
        .populate({
          path: 'lessonId',
          populate: [
            { path: 'subjectId', select: 'name' },
            { path: 'classId', select: 'name' }
          ]
        })
        .lean();

      if (examDetails && examDetails.lessonId && examDetails.lessonId.teacherId) {
        const teacher = await Teacher.findOne({ id: examDetails.lessonId.teacherId })
          .select('id name surname')
          .lean();
        
        examDetails.lessonId.teacherId = teacher || { id: examDetails.lessonId.teacherId };
      }

      resultWithDetails.exam = examDetails;
      delete resultWithDetails.examId;
    }

    // If assignment exists, populate assignment details
    if (resultWithDetails.assignmentId) {
      const assignmentDetails = await Assignment.findById(resultWithDetails.assignmentId)
        .populate({
          path: 'lessonId',
          populate: [
            { path: 'subjectId', select: 'name' },
            { path: 'classId', select: 'name' }
          ]
        })
        .lean();

      if (assignmentDetails && assignmentDetails.lessonId && assignmentDetails.lessonId.teacherId) {
        const teacher = await Teacher.findOne({ id: assignmentDetails.lessonId.teacherId })
          .select('id name surname')
          .lean();
        
        assignmentDetails.lessonId.teacherId = teacher || { id: assignmentDetails.lessonId.teacherId };
      }

      resultWithDetails.assignment = assignmentDetails;
      delete resultWithDetails.assignmentId;
    }

    res.status(201).json({
      success: true,
      data: resultWithDetails
    });
  } catch (error) {
    console.error('Error in createResult:', error);
    
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

// Get All Results
exports.getAllResults = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, studentId, examId, assignmentId, classId, teacherId, search } = req.query;
    
    let query = {};
    
    // Filter by studentId
    if (studentId) {
      if (!mongoose.Types.ObjectId.isValid(studentId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid student ID format'
        });
      }
      query.studentId = studentId;
    }

    // Filter by examId
    if (examId) {
      if (!mongoose.Types.ObjectId.isValid(examId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid exam ID format'
        });
      }
      query.examId = examId;
      query.assignmentId = null; // Only results for exams
    }

    // Filter by assignmentId
    if (assignmentId) {
      if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid assignment ID format'
        });
      }
      query.assignmentId = assignmentId;
      query.examId = null; // Only results for assignments
    }

    // Filter by classId or teacherId (requires joining through exam/assignment -> lesson)
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

      // Find exams and assignments for these lessons
      const exams = await Exam.find({ lessonId: { $in: lessonIds } }).select('_id').lean();
      const assignments = await Assignment.find({ lessonId: { $in: lessonIds } }).select('_id').lean();
      
      const examIds = exams.map(e => e._id);
      const assignmentIds = assignments.map(a => a._id);

      // Update query to include results for these exams/assignments
      query.$or = [];
      if (examIds.length > 0) {
        query.$or.push({ examId: { $in: examIds } });
      }
      if (assignmentIds.length > 0) {
        query.$or.push({ assignmentId: { $in: assignmentIds } });
      }

      if (query.$or.length === 0) {
        return res.status(200).json({
          success: true,
          count: 0,
          totalPages: 0,
          currentPage: parseInt(page),
          data: []
        });
      }
    }

    // Validate and sanitize pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));

    // Optimize search: find matching students/exams/assignments first, then filter results
    if (search && typeof search === 'string' && search.trim()) {
      const sanitizedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(sanitizedSearch, 'i');
      
      // Find matching students
      const matchingStudents = await Student.find({
        $or: [
          { name: { $regex: searchRegex } },
          { surname: { $regex: searchRegex } },
          { username: { $regex: searchRegex } }
        ]
      }).select('_id id').lean();
      
      const studentObjectIds = matchingStudents.filter(s => s._id).map(s => s._id);
      const studentStringIds = matchingStudents.filter(s => s.id).map(s => s.id);
      
      // Find matching exams (by title)
      const matchingExams = await Exam.find({
        title: { $regex: searchRegex }
      }).select('_id').lean();
      const matchingExamIds = matchingExams.map(e => e._id);
      
      // Find matching assignments (by title)
      const matchingAssignments = await Assignment.find({
        title: { $regex: searchRegex }
      }).select('_id').lean();
      const matchingAssignmentIds = matchingAssignments.map(a => a._id);
      
      // Find matching subjects (fan nomi bo'yicha qidirish)
      const matchingSubjects = await Subject.find({
        name: { $regex: searchRegex }
      }).select('_id').lean();
      const subjectIds = matchingSubjects.map(s => s._id);
      
      // Subject bo'yicha topilgan lesson'larni olish
      if (subjectIds.length > 0) {
        const lessonsWithSubjects = await Lesson.find({
          subjectId: { $in: subjectIds }
        }).select('_id').lean();
        const lessonIdsForSubjects = lessonsWithSubjects.map(l => l._id);
        
        if (lessonIdsForSubjects.length > 0) {
          // Bu lesson'lardagi exam'larni topish
          const examsForSubjects = await Exam.find({
            lessonId: { $in: lessonIdsForSubjects }
          }).select('_id').lean();
          
          // Bu lesson'lardagi assignment'larni topish
          const assignmentsForSubjects = await Assignment.find({
            lessonId: { $in: lessonIdsForSubjects }
          }).select('_id').lean();
          
          // Topilgan exam va assignment ID'larni qo'shish
          const examIdsFromSubjects = examsForSubjects.map(e => e._id);
          const assignmentIdsFromSubjects = assignmentsForSubjects.map(a => a._id);
          
          // Duplicate'larni oldini olish
          const existingExamIds = new Set(matchingExamIds.map(id => id.toString()));
          const existingAssignmentIds = new Set(matchingAssignmentIds.map(id => id.toString()));
          
          examIdsFromSubjects.forEach(id => {
            if (!existingExamIds.has(id.toString())) {
              matchingExamIds.push(id);
            }
          });
          
          assignmentIdsFromSubjects.forEach(id => {
            if (!existingAssignmentIds.has(id.toString())) {
              matchingAssignmentIds.push(id);
            }
          });
        }
      }
      
      // Build search query
      const searchConditions = [];
      
      if (studentObjectIds.length > 0 || studentStringIds.length > 0) {
        const studentConditions = [];
        if (studentObjectIds.length > 0) {
          studentConditions.push({ studentId: { $in: studentObjectIds } });
        }
        if (studentStringIds.length > 0) {
          studentConditions.push({ studentId: { $in: studentStringIds } });
        }
        if (studentConditions.length > 0) {
          searchConditions.push({ $or: studentConditions });
        }
      }
      
      if (matchingExamIds.length > 0) {
        searchConditions.push({ examId: { $in: matchingExamIds } });
      }
      
      if (matchingAssignmentIds.length > 0) {
        searchConditions.push({ assignmentId: { $in: matchingAssignmentIds } });
      }
      
      // Combine with existing query
      if (searchConditions.length > 0) {
        if (query.$or) {
          // If query already has $or, combine them
          query.$and = [
            { $or: query.$or },
            { $or: searchConditions }
          ];
          delete query.$or;
        } else {
          query.$or = searchConditions;
        }
      } else {
        // No matches found, return empty result
        return res.status(200).json({
          success: true,
          count: 0,
          totalPages: 0,
          currentPage: pageNum,
          data: []
        });
      }
    }

    // Get results with optimized query
    const results = await Result.find(query)
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .sort({ createdAt: -1 })
      .lean();

    if (results.length === 0) {
      const count = await Result.countDocuments(query);
      return res.status(200).json({
        success: true,
        count,
        totalPages: Math.ceil(count / limitNum),
        currentPage: pageNum,
        data: []
      });
    }

    // Collect all unique IDs for batch loading
    const studentIds = [];
    const examIds = [];
    const assignmentIds = [];
    const teacherIds = new Set();

    results.forEach(result => {
      if (result.studentId) {
        studentIds.push(result.studentId);
      }
      if (result.examId) {
        examIds.push(result.examId);
      }
      if (result.assignmentId) {
        assignmentIds.push(result.assignmentId);
      }
    });

    // Batch load all students (support both ObjectId and String id)
    const studentObjectIds = studentIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    const studentStringIds = studentIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
    
    const [studentsByObjectId, studentsByStringId] = await Promise.all([
      studentObjectIds.length > 0 
        ? Student.find({ _id: { $in: studentObjectIds } })
            .select('_id id username name surname email')
            .lean()
        : Promise.resolve([]),
      studentStringIds.length > 0
        ? Student.find({ id: { $in: studentStringIds } })
            .select('_id id username name surname email')
            .lean()
        : Promise.resolve([])
    ]);

    // Create student lookup maps
    const studentMap = new Map();
    studentsByObjectId.forEach(s => {
      studentMap.set(s._id.toString(), s);
      if (s.id) studentMap.set(s.id, s);
    });
    studentsByStringId.forEach(s => {
      studentMap.set(s.id, s);
      studentMap.set(s._id.toString(), s);
    });

    // Batch load all exams with populated lesson data
    const exams = examIds.length > 0
      ? await Exam.find({ _id: { $in: examIds } })
          .populate({
            path: 'lessonId',
            populate: [
              { path: 'subjectId', select: 'name' },
              { path: 'classId', select: 'name' }
            ]
          })
          .lean()
      : [];

    const examMap = new Map();
    exams.forEach(exam => {
      examMap.set(exam._id.toString(), exam);
      if (exam.lessonId && exam.lessonId.teacherId) {
        teacherIds.add(exam.lessonId.teacherId);
      }
    });

    // Batch load all assignments with populated lesson data
    const assignments = assignmentIds.length > 0
      ? await Assignment.find({ _id: { $in: assignmentIds } })
          .populate({
            path: 'lessonId',
            populate: [
              { path: 'subjectId', select: 'name' },
              { path: 'classId', select: 'name' }
            ]
          })
          .lean()
      : [];

    const assignmentMap = new Map();
    assignments.forEach(assignment => {
      assignmentMap.set(assignment._id.toString(), assignment);
      if (assignment.lessonId && assignment.lessonId.teacherId) {
        teacherIds.add(assignment.lessonId.teacherId);
      }
    });

    // Batch load all teachers
    const teachers = teacherIds.size > 0
      ? await Teacher.find({ id: { $in: Array.from(teacherIds) } })
          .select('id name surname')
          .lean()
      : [];

    const teacherMap = new Map();
    teachers.forEach(teacher => {
      teacherMap.set(teacher.id, teacher);
    });

    // Attach teachers to exams and assignments
    exams.forEach(exam => {
      if (exam.lessonId && exam.lessonId.teacherId) {
        exam.lessonId.teacherId = teacherMap.get(exam.lessonId.teacherId) || { id: exam.lessonId.teacherId };
      }
    });

    assignments.forEach(assignment => {
      if (assignment.lessonId && assignment.lessonId.teacherId) {
        assignment.lessonId.teacherId = teacherMap.get(assignment.lessonId.teacherId) || { id: assignment.lessonId.teacherId };
      }
    });

    // Process results and attach related data
    const processedResults = results.map(result => {
      const processed = { ...result };

      // Attach student
      if (result.studentId) {
        const studentIdStr = result.studentId.toString();
        const student = studentMap.get(studentIdStr) || studentMap.get(result.studentId);
        processed.student = student || { _id: result.studentId };
        delete processed.studentId;
      }

      // Attach exam
      if (result.examId) {
        const exam = examMap.get(result.examId.toString());
        processed.exam = exam || null;
        delete processed.examId;
      }

      // Attach assignment
      if (result.assignmentId) {
        const assignment = assignmentMap.get(result.assignmentId.toString());
        processed.assignment = assignment || null;
        delete processed.assignmentId;
      }

      return processed;
    });

    // Get total count
    const count = await Result.countDocuments(query);

    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
      data: processedResults
    });
  } catch (error) {
    console.error('Error in getAllResults:', error);
    next(error);
  }
};

// Get Single Result
exports.getResult = async (req, res, next) => {
  try {
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid result ID format'
      });
    }

    const result = await Result.findById(req.params.id)
      .populate('examId')
      .populate('assignmentId')
      .lean();
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Result not found'
      });
    }

    // Populate student - backward compatibility: support both ObjectId and String (id field)
    if (result.studentId) {
      let student = null;
      
      // Try ObjectId first (new format)
      if (mongoose.Types.ObjectId.isValid(result.studentId)) {
        student = await Student.findById(result.studentId)
          .select('id username name surname email phone')
          .lean();
      }
      
      // If not found, try String id field (old format)
      if (!student) {
        student = await Student.findOne({ id: result.studentId })
          .select('id username name surname email phone')
          .lean();
      }
      
      result.student = student || { _id: result.studentId };
      delete result.studentId;
    }

    // Populate exam with lesson details
    if (result.examId) {
      const exam = await Exam.findById(result.examId)
        .populate({
          path: 'lessonId',
          populate: [
            { path: 'subjectId', select: 'name' },
            { path: 'classId', select: 'name capacity' }
          ]
        })
        .lean();

      if (exam && exam.lessonId && exam.lessonId.teacherId) {
        const teacher = await Teacher.findOne({ id: exam.lessonId.teacherId })
          .select('id name surname email phone')
          .lean();
        
        exam.lessonId.teacherId = teacher || { id: exam.lessonId.teacherId };
      }

      result.exam = exam;
      delete result.examId;
    }

    // Populate assignment with lesson details
    if (result.assignmentId) {
      const assignment = await Assignment.findById(result.assignmentId)
        .populate({
          path: 'lessonId',
          populate: [
            { path: 'subjectId', select: 'name' },
            { path: 'classId', select: 'name capacity' }
          ]
        })
        .lean();

      if (assignment && assignment.lessonId && assignment.lessonId.teacherId) {
        const teacher = await Teacher.findOne({ id: assignment.lessonId.teacherId })
          .select('id name surname email phone')
          .lean();
        
        assignment.lessonId.teacherId = teacher || { id: assignment.lessonId.teacherId };
      }

      result.assignment = assignment;
      delete result.assignmentId;
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in getResult:', error);
    next(error);
  }
};

// Update Result
exports.updateResult = async (req, res, next) => {
  try {
    // Validate result ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid result ID format'
      });
    }

    const { score, examId, assignmentId, studentId } = req.body;

    // Get existing result
    const existingResult = await Result.findById(req.params.id);
    if (!existingResult) {
      return res.status(404).json({
        success: false,
        error: 'Result not found'
      });
    }

    // Validate: examId va assignmentId'ni bir vaqtning o'zida o'zgartirib bo'lmaydi
    const newExamId = examId !== undefined ? examId : existingResult.examId;
    const newAssignmentId = assignmentId !== undefined ? assignmentId : existingResult.assignmentId;

    if (!newExamId && !newAssignmentId) {
      return res.status(400).json({
        success: false,
        error: 'Either examId or assignmentId must be provided'
      });
    }

    if (newExamId && newAssignmentId) {
      return res.status(400).json({
        success: false,
        error: 'Result cannot be associated with both exam and assignment. Please provide only one.'
      });
    }

    // Validate studentId if provided
    if (studentId) {
      if (!mongoose.Types.ObjectId.isValid(studentId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid student ID format'
        });
      }

      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({
          success: false,
          error: 'Student not found'
        });
      }
    }

    // Validate score if provided
    if (score !== undefined) {
      if (typeof score !== 'number' || score < 0 || score > 100) {
        return res.status(400).json({
          success: false,
          error: 'Score must be a number between 0 and 100'
        });
      }
    }

    // Verify exam or assignment exists if being updated
    if (examId !== undefined && examId !== null) {
      if (!mongoose.Types.ObjectId.isValid(examId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid exam ID format'
        });
      }

      const exam = await Exam.findById(examId);
      if (!exam) {
        return res.status(404).json({
          success: false,
          error: 'Exam not found'
        });
      }
    }

    if (assignmentId !== undefined && assignmentId !== null) {
      if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid assignment ID format'
        });
      }

      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) {
        return res.status(404).json({
          success: false,
          error: 'Assignment not found'
        });
      }
    }

    // Build update object
    const updateData = {};
    if (score !== undefined) updateData.score = score;
    if (studentId !== undefined) updateData.studentId = studentId;
    if (examId !== undefined) {
      updateData.examId = examId;
      updateData.assignmentId = null; // Clear assignmentId if examId is set
    }
    if (assignmentId !== undefined) {
      updateData.assignmentId = assignmentId;
      updateData.examId = null; // Clear examId if assignmentId is set
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    // Update result
    const result = await Result.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('examId')
    .populate('assignmentId')
    .lean();

    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Result not found'
      });
    }

    // Populate student - backward compatibility: support both ObjectId and String (id field)
    if (result.studentId) {
      let student = null;
      
      // Try ObjectId first (new format)
      if (mongoose.Types.ObjectId.isValid(result.studentId)) {
        student = await Student.findById(result.studentId)
          .select('id username name surname email phone')
          .lean();
      }
      
      // If not found, try String id field (old format)
      if (!student) {
        student = await Student.findOne({ id: result.studentId })
          .select('id username name surname email phone')
          .lean();
      }
      
      result.student = student || { _id: result.studentId };
      delete result.studentId;
    }

    // Populate exam with lesson details
    if (result.examId) {
      const exam = await Exam.findById(result.examId)
        .populate({
          path: 'lessonId',
          populate: [
            { path: 'subjectId', select: 'name' },
            { path: 'classId', select: 'name capacity' }
          ]
        })
        .lean();

      if (exam && exam.lessonId && exam.lessonId.teacherId) {
        const teacher = await Teacher.findOne({ id: exam.lessonId.teacherId })
          .select('id name surname email phone')
          .lean();
        
        exam.lessonId.teacherId = teacher || { id: exam.lessonId.teacherId };
      }

      result.exam = exam;
      delete result.examId;
    }

    // Populate assignment with lesson details
    if (result.assignmentId) {
      const assignment = await Assignment.findById(result.assignmentId)
        .populate({
          path: 'lessonId',
          populate: [
            { path: 'subjectId', select: 'name' },
            { path: 'classId', select: 'name capacity' }
          ]
        })
        .lean();

      if (assignment && assignment.lessonId && assignment.lessonId.teacherId) {
        const teacher = await Teacher.findOne({ id: assignment.lessonId.teacherId })
          .select('id name surname email phone')
          .lean();
        
        assignment.lessonId.teacherId = teacher || { id: assignment.lessonId.teacherId };
      }

      result.assignment = assignment;
      delete result.assignmentId;
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in updateResult:', error);
    
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

// Delete Result
exports.deleteResult = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid result ID format'
      });
    }

    const result = await Result.findByIdAndDelete(req.params.id);

    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Result not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error in deleteResult:', error);
    next(error);
  }
};

