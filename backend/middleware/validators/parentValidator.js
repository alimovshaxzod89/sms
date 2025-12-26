const mongoose = require('mongoose');

// ✅ Helper function for validation errors
const validationError = (res, message) => {
  return res.status(400).json({
    success: false,
    error: message
  });
};

// ✅ Validate parent creation
exports.validateParent = (req, res, next) => {
  const {
    username,
    password,
    name,
    surname,
    email,
    phone,
    address
  } = req.body;

  // Required fields
  if (!username || !password || !name || !surname || !phone || !address) {
    return validationError(res, 'Please provide all required fields: username, password, name, surname, phone, address');
  }

  // Username validation
  if (username.length < 3 || username.length > 20) {
    return validationError(res, 'Username must be between 3 and 20 characters');
  }

  // Username format (only alphanumeric and underscore)
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return validationError(res, 'Username can only contain letters, numbers, and underscores');
  }

  // Password validation
  if (password.length < 8) {
    return validationError(res, 'Password must be at least 8 characters long');
  }

  // Name validation
  if (name.length < 2 || name.length > 50) {
    return validationError(res, 'Name must be between 2 and 50 characters');
  }

  if (surname.length < 2 || surname.length > 50) {
    return validationError(res, 'Surname must be between 2 and 50 characters');
  }

  // Address validation
  if (address.length < 5 || address.length > 200) {
    return validationError(res, 'Address must be between 5 and 200 characters');
  }

  // Email validation (optional)
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return validationError(res, 'Invalid email format');
    }
  }

  // Phone validation (required)
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  if (!phoneRegex.test(phone.replace(/[\s-]/g, ''))) {
    return validationError(res, 'Invalid phone number format');
  }

  next();
};

// ✅ Validate parent update
exports.validateParentUpdate = (req, res, next) => {
  const {
    username,
    password,
    name,
    surname,
    email,
    phone,
    address
  } = req.body;

  // At least one field must be provided
  const hasFields = username || password || name || surname || email || phone || address;
  
  if (!hasFields) {
    return validationError(res, 'Please provide at least one field to update');
  }

  // Username validation (if provided)
  if (username !== undefined) {
    if (username.length < 3 || username.length > 20) {
      return validationError(res, 'Username must be between 3 and 20 characters');
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return validationError(res, 'Username can only contain letters, numbers, and underscores');
    }
  }

  // Password validation (if provided)
  if (password !== undefined && password.trim() !== '') {
    if (password.length < 8) {
      return validationError(res, 'Password must be at least 8 characters long');
    }
  }

  // Name validation (if provided)
  if (name !== undefined) {
    if (name.length < 2 || name.length > 50) {
      return validationError(res, 'Name must be between 2 and 50 characters');
    }
  }

  if (surname !== undefined) {
    if (surname.length < 2 || surname.length > 50) {
      return validationError(res, 'Surname must be between 2 and 50 characters');
    }
  }

  // Address validation (if provided)
  if (address !== undefined) {
    if (address.length < 5 || address.length > 200) {
      return validationError(res, 'Address must be between 5 and 200 characters');
    }
  }

  // Email validation (if provided)
  if (email !== undefined && email !== null && email !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return validationError(res, 'Invalid email format');
    }
  }

  // Phone validation (if provided)
  if (phone !== undefined && phone !== null && phone !== '') {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone.replace(/[\s-]/g, ''))) {
      return validationError(res, 'Invalid phone number format');
    }
  }

  next();
};

