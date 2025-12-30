const express = require('express');
const router = express.Router();
const {
  createAnnouncement,
  getAllAnnouncements,
  getAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} = require('../controllers/announcementController');

// Authentication middleware import
const { protect, authorize } = require('../middleware/auth');
const { validateAnnouncement, validateAnnouncementUpdate } = require('../middleware/validators/announcementValidator');

// Added to all routes that require authentication
router.route('/')
  .get(protect, authorize('admin', 'teacher', 'student'), getAllAnnouncements)
  .post(protect, authorize('admin', 'teacher'), validateAnnouncement, createAnnouncement);

router.route('/:id')
  .get(protect, authorize('admin', 'teacher', 'student'), getAnnouncement)
  .put(protect, authorize('admin', 'teacher'), validateAnnouncementUpdate, updateAnnouncement)
  .delete(protect, authorize('admin', 'teacher'), deleteAnnouncement);

module.exports = router;

