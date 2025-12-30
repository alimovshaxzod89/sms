const mongoose = require('mongoose');

// Helper function for validation errors
const validationError = (res, message) => {
  return res.status(400).json({
    success: false,
    error: message
  });
};

// Validate result creation
exports.validateResult = (req, res, next) => {
  const { score, examId, assignmentId, studentId } = req.body;

  // Required fields
  if (!studentId) {
    return validationError(res, 'Student ID is required');
  }

  if (score === undefined || score === null) {
    return validationError(res, 'Score is required');
  }

  // Validate: examId va assignmentId'ning bittasi bo'lishi kerak
  if (!examId && !assignmentId) {
    return validationError(res, 'Either examId or assignmentId must be provided');
  }

  // Validate: ikkalasi ham bo'lmashi kerak
  if (examId && assignmentId) {
    return validationError(res, 'Result cannot be associated with both exam and assignment. Please provide only one.');
  }

  // Score validation
  if (typeof score !== 'number' || isNaN(score)) {
    return validationError(res, 'Score must be a valid number');
  }

  if (score < 0 || score > 100) {
    return validationError(res, 'Score must be between 0 and 100');
  }

  // StudentId validation (it's a String, not ObjectId)
  if (typeof studentId !== 'string' || studentId.trim() === '') {
    return validationError(res, 'Student ID must be a non-empty string');
  }

  // ExamId validation (if provided)
  if (examId) {
    if (!mongoose.Types.ObjectId.isValid(examId)) {
      return validationError(res, 'Invalid exam ID format');
    }
  }

  // AssignmentId validation (if provided)
  if (assignmentId) {
    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      return validationError(res, 'Invalid assignment ID format');
    }
  }

  next();
};

// Validate result update
exports.validateResultUpdate = (req, res, next) => {
  const { score, examId, assignmentId, studentId } = req.body;

  // At least one field must be provided
  if (score === undefined && examId === undefined && assignmentId === undefined && studentId === undefined) {
    return validationError(res, 'Please provide at least one field to update');
  }

  // Score validation (if provided)
  if (score !== undefined && score !== null) {
    if (typeof score !== 'number' || isNaN(score)) {
      return validationError(res, 'Score must be a valid number');
    }

    if (score < 0 || score > 100) {
      return validationError(res, 'Score must be between 0 and 100');
    }
  }

  // Validate: examId va assignmentId'ni bir vaqtning o'zida o'zgartirib bo'lmaydi
  if (examId !== undefined && assignmentId !== undefined) {
    return validationError(res, 'Result cannot be associated with both exam and assignment. Please provide only one.');
  }

  // StudentId validation (if provided)
  if (studentId !== undefined) {
    if (typeof studentId !== 'string' || studentId.trim() === '') {
      return validationError(res, 'Student ID must be a non-empty string');
    }
  }

  // ExamId validation (if provided)
  if (examId !== undefined && examId !== null) {
    if (!mongoose.Types.ObjectId.isValid(examId)) {
      return validationError(res, 'Invalid exam ID format');
    }
  }

  // AssignmentId validation (if provided)
  if (assignmentId !== undefined && assignmentId !== null) {
    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      return validationError(res, 'Invalid assignment ID format');
    }
  }

  next();
};

