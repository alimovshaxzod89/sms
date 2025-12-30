const mongoose = require('mongoose');

// Helper function for validation errors
const validationError = (res, message) => {
  return res.status(400).json({
    success: false,
    error: message
  });
};

// Validate assignment creation
exports.validateAssignment = (req, res, next) => {
  const { title, startDate, dueDate, lessonId } = req.body;

  // Required fields
  if (!title || !startDate || !dueDate || !lessonId) {
    return validationError(res, 'Please provide all required fields: title, startDate, dueDate, lessonId');
  }

  // Title validation
  if (typeof title !== 'string' || title.trim().length === 0) {
    return validationError(res, 'Title is required and must be a non-empty string');
  }

  if (title.length < 2 || title.length > 200) {
    return validationError(res, 'Title must be between 2 and 200 characters');
  }

  // Date validation
  const start = new Date(startDate);
  const due = new Date(dueDate);

  if (isNaN(start.getTime())) {
    return validationError(res, 'Invalid startDate format');
  }

  if (isNaN(due.getTime())) {
    return validationError(res, 'Invalid dueDate format');
  }

  if (due <= start) {
    return validationError(res, 'Due date must be after start date');
  }

  // LessonId validation
  if (!mongoose.Types.ObjectId.isValid(lessonId)) {
    return validationError(res, 'Invalid lesson ID format');
  }

  next();
};

// Validate assignment update
exports.validateAssignmentUpdate = (req, res, next) => {
  const { title, startDate, dueDate, lessonId } = req.body;

  // At least one field must be provided
  if (title === undefined && startDate === undefined && dueDate === undefined && lessonId === undefined) {
    return validationError(res, 'Please provide at least one field to update');
  }

  // Title validation (if provided)
  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      return validationError(res, 'Title cannot be empty');
    }
    if (title.length < 2 || title.length > 200) {
      return validationError(res, 'Title must be between 2 and 200 characters');
    }
  }

  // Date validation (if provided)
  if (startDate !== undefined) {
    const start = new Date(startDate);
    if (isNaN(start.getTime())) {
      return validationError(res, 'Invalid startDate format');
    }
  }

  if (dueDate !== undefined) {
    const due = new Date(dueDate);
    if (isNaN(due.getTime())) {
      return validationError(res, 'Invalid dueDate format');
    }
  }

  // If both dates are provided, validate relationship
  if (startDate !== undefined && dueDate !== undefined) {
    const start = new Date(startDate);
    const due = new Date(dueDate);
    if (due <= start) {
      return validationError(res, 'Due date must be after start date');
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

