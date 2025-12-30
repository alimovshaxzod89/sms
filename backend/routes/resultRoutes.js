const express = require('express');
const router = express.Router();
const {
  createResult,
  getAllResults,
  getResult,
  updateResult,
  deleteResult
} = require('../controllers/resultController');

// Authentication middleware import
const { protect, authorize } = require('../middleware/auth');
const { validateResult, validateResultUpdate } = require('../middleware/validators/resultValidator');

// Added to all routes that require authentication
router.route('/')
  .get(protect, authorize('admin', 'teacher', 'student'), getAllResults)
  .post(protect, authorize('admin', 'teacher'), validateResult, createResult);

router.route('/:id')
  .get(protect, authorize('admin', 'teacher', 'student'), getResult)
  .put(protect, authorize('admin', 'teacher'), validateResultUpdate, updateResult)
  .delete(protect, authorize('admin', 'teacher'), deleteResult);

module.exports = router;

