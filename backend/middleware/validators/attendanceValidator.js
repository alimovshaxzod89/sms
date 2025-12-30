const mongoose = require('mongoose');

// Helper function for validation errors
const validationError = (res, message) => {
  return res.status(400).json({
    success: false,
    error: message
  });
};

// Validate attendance creation
exports.validateAttendance = (req, res, next) => {
  const { date, present, studentId, lessonId } = req.body;

  // Required fields
  if (!date) {
    return validationError(res, 'Date is required');
  }

  if (present === undefined || present === null) {
    return validationError(res, 'Present field is required');
  }

  if (!studentId) {
    return validationError(res, 'Student ID is required');
  }

  if (!lessonId) {
    return validationError(res, 'Lesson ID is required');
  }

  // Date validation
  const attendanceDate = new Date(date);
  if (isNaN(attendanceDate.getTime())) {
    return validationError(res, 'Invalid date format');
  }

  // Present validation
  if (typeof present !== 'boolean') {
    return validationError(res, 'Present must be a boolean value (true or false)');
  }

  // StudentId validation (it's a String, not ObjectId)
  if (typeof studentId !== 'string' || studentId.trim() === '') {
    return validationError(res, 'Student ID must be a non-empty string');
  }

  // LessonId validation
  if (!mongoose.Types.ObjectId.isValid(lessonId)) {
    return validationError(res, 'Invalid lesson ID format');
  }

  next();
};

// Validate attendance update
exports.validateAttendanceUpdate = (req, res, next) => {
  const { date, present, studentId, lessonId } = req.body;

  // At least one field must be provided
  if (date === undefined && present === undefined && studentId === undefined && lessonId === undefined) {
    return validationError(res, 'Please provide at least one field to update');
  }

  // Date validation (if provided)
  if (date !== undefined) {
    const attendanceDate = new Date(date);
    if (isNaN(attendanceDate.getTime())) {
      return validationError(res, 'Invalid date format');
    }
  }

  // Present validation (if provided)
  if (present !== undefined && present !== null) {
    if (typeof present !== 'boolean') {
      return validationError(res, 'Present must be a boolean value (true or false)');
    }
  }

  // StudentId validation (if provided)
  if (studentId !== undefined) {
    if (typeof studentId !== 'string' || studentId.trim() === '') {
      return validationError(res, 'Student ID must be a non-empty string');
    }
  }

  // LessonId validation (if provided)
  if (lessonId !== undefined) {
    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      return validationError(res, 'Invalid lesson ID format');
    }
  }

  next();
};

