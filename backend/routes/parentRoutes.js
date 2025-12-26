const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const {
  createParent,
  getAllParents,
  getParent,
  updateParent,
  deleteParent
} = require('../controllers/parentController');
const { protect, authorize } = require('../middleware/auth');
const { validateParent, validateParentUpdate } = require('../middleware/validators/parentValidator');

// ✅ Parent-specific rate limiting
const parentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 daqiqa
  max: 50, // Har bir IP uchun 50 ta request
  message: {
    success: false,
    error: 'Too many requests for parent operations, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ✅ Stricter rate limiting for create/update/delete
const parentMutationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    error: 'Too many modification requests, please try again later'
  }
});

// ✅ Apply rate limiting to all parent routes
router.use(parentLimiter);

// ============================================
// PROTECTED ROUTES - Authentication required
// ============================================

/**
 * @route   GET /api/parents
 * @desc    Get all parents with pagination and filtering
 * @access  Private (Admin, Teacher)
 */
router.get(
  '/',
  protect,
  authorize('admin', 'teacher'),
  getAllParents
);

/**
 * @route   POST /api/parents
 * @desc    Create new parent
 * @access  Private (Admin only)
 */
router.post(
  '/',
  protect,
  authorize('admin'),
  parentMutationLimiter,
  validateParent,
  createParent
);

/**
 * @route   GET /api/parents/:id
 * @desc    Get single parent by ID
 * @access  Private (Admin, Teacher, Parent - own profile only)
 */
router.get(
  '/:id',
  protect,
  authorize('admin', 'teacher', 'parent'),
  getParent
);

/**
 * @route   PUT /api/parents/:id
 * @desc    Update parent information
 * @access  Private (Admin, Parent - own profile only)
 */
router.put(
  '/:id',
  protect,
  authorize('admin', 'parent'),
  parentMutationLimiter,
  validateParentUpdate,
  updateParent
);

/**
 * @route   DELETE /api/parents/:id
 * @desc    Delete parent
 * @access  Private (Admin only)
 */
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  parentMutationLimiter,
  deleteParent
);

module.exports = router;

