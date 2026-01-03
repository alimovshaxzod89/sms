const mongoose = require('mongoose');
const Announcement = require('../models/Announcement');
const Class = require('../models/Class');

// Create Announcement
exports.createAnnouncement = async (req, res, next) => {
  try {
    const { title, description, date, classId } = req.body;

    // Validate title
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Title is required'
      });
    }

    // Validate description
    if (!description || typeof description !== 'string' || description.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Description is required'
      });
    }

    // Validate date
    if (!date) {
      return res.status(400).json({
        success: false,
        error: 'Date is required'
      });
    }

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
      return res.status(400).json({
        success: false,
        error: 'Invalid date format'
      });
    }

    // Validate classId if provided
    if (classId) {
      if (!mongoose.Types.ObjectId.isValid(classId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid class ID format'
        });
      }

      const classData = await Class.findById(classId);
      if (!classData) {
        return res.status(404).json({
          success: false,
          error: 'Class not found'
        });
      }
    }

    // Create announcement
    const announcement = await Announcement.create({
      title: title.trim(),
      description: description.trim(),
      date: announcementDate,
      classId: classId || null
    });

    // Populate announcement with class details
    const announcementWithDetails = await Announcement.findById(announcement._id)
      .populate('classId', 'name capacity')
      .lean();

    res.status(201).json({
      success: true,
      data: announcementWithDetails
    });
  } catch (error) {
    console.error('Error in createAnnouncement:', error);
    
    // Mongoose validation error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }
    
    next(error);
  }
};

// Get All Announcements
exports.getAllAnnouncements = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, classId, startDate, endDate } = req.query;
    
    let query = {};
    
    // Filter by classId
    if (classId) {
      if (!mongoose.Types.ObjectId.isValid(classId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid class ID format'
        });
      }
      query.classId = classId;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.date = {};
      
      if (startDate) {
        const start = new Date(startDate);
        if (isNaN(start.getTime())) {
          return res.status(400).json({
            success: false,
            error: 'Invalid start date format'
          });
        }
        // Set to start of day
        start.setHours(0, 0, 0, 0);
        query.date.$gte = start;
      }

      if (endDate) {
        const end = new Date(endDate);
        if (isNaN(end.getTime())) {
          return res.status(400).json({
            success: false,
            error: 'Invalid end date format'
          });
        }
        // Set to end of day
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    // Search by title or description
    if (search && typeof search === 'string') {
      const sanitizedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { title: { $regex: sanitizedSearch, $options: 'i' } },
        { description: { $regex: sanitizedSearch, $options: 'i' } }
      ];
    }

    // Validate and sanitize pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));

    // Get announcements
    const announcements = await Announcement.find(query)
      .populate('classId', 'name capacity')
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .sort({ date: -1 })
      .lean();

    const count = await Announcement.countDocuments(query);

    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
      data: announcements
    });
  } catch (error) {
    console.error('Error in getAllAnnouncements:', error);
    next(error);
  }
};

// Get Single Announcement
exports.getAnnouncement = async (req, res, next) => {
  try {
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid announcement ID format'
      });
    }

    const announcement = await Announcement.findById(req.params.id)
      .populate('classId', 'name capacity')
      .lean();
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        error: 'Announcement not found'
      });
    }

    res.status(200).json({
      success: true,
      data: announcement
    });
  } catch (error) {
    console.error('Error in getAnnouncement:', error);
    next(error);
  }
};

// Update Announcement
exports.updateAnnouncement = async (req, res, next) => {
  try {
    // Validate announcement ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid announcement ID format'
      });
    }

    const { title, description, date, classId } = req.body;

    // Get existing announcement
    const existingAnnouncement = await Announcement.findById(req.params.id);
    if (!existingAnnouncement) {
      return res.status(404).json({
        success: false,
        error: 'Announcement not found'
      });
    }

    // Build update object
    const updateData = {};

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'Title cannot be empty'
        });
      }
      updateData.title = title.trim();
    }

    if (description !== undefined) {
      if (typeof description !== 'string' || description.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'Description cannot be empty'
        });
      }
      updateData.description = description.trim();
    }

    // Validate date if provided
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
        return res.status(400).json({
          success: false,
          error: 'Invalid date format'
        });
      }
      updateData.date = announcementDate;
    }

    // Validate classId if provided
    if (classId !== undefined) {
      if (classId === null || classId === '') {
        updateData.classId = null;
      } else {
        if (!mongoose.Types.ObjectId.isValid(classId)) {
          return res.status(400).json({
            success: false,
            error: 'Invalid class ID format'
          });
        }

        const classData = await Class.findById(classId);
        if (!classData) {
          return res.status(404).json({
            success: false,
            error: 'Class not found'
          });
        }

        updateData.classId = classId;
      }
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    // Update announcement
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('classId', 'name capacity')
    .lean();

    if (!announcement) {
      return res.status(404).json({
        success: false,
        error: 'Announcement not found'
      });
    }

    res.status(200).json({
      success: true,
      data: announcement
    });
  } catch (error) {
    console.error('Error in updateAnnouncement:', error);
    
    // Mongoose validation error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }
    
    next(error);
  }
};

// Delete Announcement
exports.deleteAnnouncement = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid announcement ID format'
      });
    }

    const announcement = await Announcement.findByIdAndDelete(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        error: 'Announcement not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error in deleteAnnouncement:', error);
    next(error);
  }
};

