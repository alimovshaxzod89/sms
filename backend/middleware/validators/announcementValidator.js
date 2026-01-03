const mongoose = require('mongoose');

// Helper function for validation errors
const validationError = (res, message) => {
  return res.status(400).json({
    success: false,
    error: message
  });
};

// Validate announcement creation
exports.validateAnnouncement = (req, res, next) => {
  const { title, description, date, classId } = req.body;

  // Required fields
  if (!title) {
    return validationError(res, 'Title is required');
  }

  if (!description) {
    return validationError(res, 'Description is required');
  }

  if (!date) {
    return validationError(res, 'Date is required');
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
    return validationError(res, 'Invalid date format');
  }

  // ClassId validation (optional)
  if (classId !== undefined && classId !== null && classId !== '') {
    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return validationError(res, 'Invalid class ID format');
    }
  }

  next();
};

// Validate announcement update
exports.validateAnnouncementUpdate = (req, res, next) => {
  const { title, description, date, classId } = req.body;

  // At least one field must be provided
  if (title === undefined && description === undefined && date === undefined && classId === undefined) {
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
      return validationError(res, 'Invalid date format');
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

