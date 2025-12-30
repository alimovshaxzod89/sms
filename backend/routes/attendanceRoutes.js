const express = require('express');
const router = express.Router();
const {
  createAttendance,
  getAllAttendances,
  getAttendance,
  updateAttendance,
  deleteAttendance
} = require('../controllers/attendanceController');

// Authentication middleware import
const { protect, authorize } = require('../middleware/auth');
const { validateAttendance, validateAttendanceUpdate } = require('../middleware/validators/attendanceValidator');

// Added to all routes that require authentication
router.route('/')
  .get(protect, authorize('admin', 'teacher', 'student'), getAllAttendances)
  .post(protect, authorize('admin', 'teacher'), validateAttendance, createAttendance);

router.route('/:id')
  .get(protect, authorize('admin', 'teacher', 'student'), getAttendance)
  .put(protect, authorize('admin', 'teacher'), validateAttendanceUpdate, updateAttendance)
  .delete(protect, authorize('admin', 'teacher'), deleteAttendance);

module.exports = router;

