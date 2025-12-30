const mongoose = require('mongoose');

// Helper function for validation errors
const validationError = (res, message) => {
  return res.status(400).json({
    success: false,
    error: message
  });
};

// Validate event creation
exports.validateEvent = (req, res, next) => {
  const { title, description, startTime, endTime, classId } = req.body;

  // Required fields
  if (!title) {
    return validationError(res, 'Title is required');
  }

  if (!description) {
    return validationError(res, 'Description is required');
  }

  if (!startTime) {
    return validationError(res, 'Start time is required');
  }

  if (!endTime) {
    return validationError(res, 'End time is required');
  }

  // Title validation
  if (typeof title !== 'string' || title.trim().length === 0) {
    return validationError(res, 'Title must be a non-empty string');
  }

  if (title.length > 200) {
    return validationError(res, 'Title cannot exceed 200 characters');
  }

  // Description validation
  if (typeof description !== 'string' || description.trim().length === 0) {
    return validationError(res, 'Description must be a non-empty string');
  }

  if (description.length > 5000) {
    return validationError(res, 'Description cannot exceed 5000 characters');
  }

  // Date validation
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (isNaN(start.getTime())) {
    return validationError(res, 'Invalid start time format');
  }

  if (isNaN(end.getTime())) {
    return validationError(res, 'Invalid end time format');
  }

  if (start >= end) {
    return validationError(res, 'End time must be after start time');
  }

  // ClassId validation (optional)
  if (classId !== undefined && classId !== null && classId !== '') {
    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return validationError(res, 'Invalid class ID format');
    }
  }

  next();
};

// Validate event update
exports.validateEventUpdate = (req, res, next) => {
  const { title, description, startTime, endTime, classId } = req.body;

  // At least one field must be provided
  if (title === undefined && description === undefined && startTime === undefined && endTime === undefined && classId === undefined) {
    return validationError(res, 'Please provide at least one field to update');
  }

  // Title validation (if provided)
  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length === 0) {
      return validationError(res, 'Title cannot be empty');
    }

    if (title.length > 200) {
      return validationError(res, 'Title cannot exceed 200 characters');
    }
  }

  // Description validation (if provided)
  if (description !== undefined) {
    if (typeof description !== 'string' || description.trim().length === 0) {
      return validationError(res, 'Description cannot be empty');
    }

    if (description.length > 5000) {
      return validationError(res, 'Description cannot exceed 5000 characters');
    }
  }

  // Date validation (if provided)
  if (startTime !== undefined) {
    const start = new Date(startTime);
    if (isNaN(start.getTime())) {
      return validationError(res, 'Invalid start time format');
    }
  }

  if (endTime !== undefined) {
    const end = new Date(endTime);
    if (isNaN(end.getTime())) {
      return validationError(res, 'Invalid end time format');
    }
  }

  // If both dates are provided, validate relationship
  if (startTime !== undefined && endTime !== undefined) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (start >= end) {
      return validationError(res, 'End time must be after start time');
    }
  }

  // ClassId validation (if provided)
  if (classId !== undefined) {
    if (classId === null || classId === '') {
      // Allow null/empty to remove class association
      // This is valid
    } else if (!mongoose.Types.ObjectId.isValid(classId)) {
      return validationError(res, 'Invalid class ID format');
    }
  }

  next();
};

