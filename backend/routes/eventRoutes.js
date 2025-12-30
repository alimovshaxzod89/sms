const express = require('express');
const router = express.Router();
const {
  createEvent,
  getAllEvents,
  getEvent,
  updateEvent,
  deleteEvent
} = require('../controllers/eventController');

// Authentication middleware import
const { protect, authorize } = require('../middleware/auth');
const { validateEvent, validateEventUpdate } = require('../middleware/validators/eventValidator');

// Added to all routes that require authentication
router.route('/')
  .get(protect, authorize('admin', 'teacher', 'student'), getAllEvents)
  .post(protect, authorize('admin', 'teacher'), validateEvent, createEvent);

router.route('/:id')
  .get(protect, authorize('admin', 'teacher', 'student'), getEvent)
  .put(protect, authorize('admin', 'teacher'), validateEventUpdate, updateEvent)
  .delete(protect, authorize('admin', 'teacher'), deleteEvent);

module.exports = router;

