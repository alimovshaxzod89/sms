const express = require('express');
const router = express.Router();
const {
  createAssignment,
  getAllAssignments,
  getAssignment,
  updateAssignment,
  deleteAssignment
} = require('../controllers/assignmentController');

// Authentication middleware import
const { protect, authorize } = require('../middleware/auth');
const { validateAssignment, validateAssignmentUpdate } = require('../middleware/validators/assignmentValidator');

// Added to all routes that require authentication
router.route('/')
  .get(protect, authorize('admin', 'teacher', 'student'), getAllAssignments)
  .post(protect, authorize('admin', 'teacher'), validateAssignment, createAssignment);

router.route('/:id')
  .get(protect, authorize('admin', 'teacher', 'student'), getAssignment)
  .put(protect, authorize('admin', 'teacher'), validateAssignmentUpdate, updateAssignment)
  .delete(protect, authorize('admin', 'teacher'), deleteAssignment);

module.exports = router;

