const mongoose = require('mongoose');
const Event = require('../models/Event');
const Class = require('../models/Class');

// Create Event
exports.createEvent = async (req, res, next) => {
  try {
    const { title, description, startTime, endTime, classId } = req.body;

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

    // Validate startTime and endTime
    if (!startTime || !endTime) {
      return res.status(400).json({
        success: false,
        error: 'Start time and end time are required'
      });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format'
      });
    }

    if (start >= end) {
      return res.status(400).json({
        success: false,
        error: 'End time must be after start time'
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

    // Create event
    const event = await Event.create({
      title: title.trim(),
      description: description.trim(),
      startTime: start,
      endTime: end,
      classId: classId || null
    });

    // Populate event with class details
    const eventWithDetails = await Event.findById(event._id)
      .populate('classId', 'name capacity')
      .lean();

    res.status(201).json({
      success: true,
      data: eventWithDetails
    });
  } catch (error) {
    console.error('Error in createEvent:', error);
    
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

// Get All Events
exports.getAllEvents = async (req, res, next) => {
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
      query.startTime = {};
      
      if (startDate) {
        const start = new Date(startDate);
        if (isNaN(start.getTime())) {
          return res.status(400).json({
            success: false,
            error: 'Invalid start date format'
          });
        }
        query.startTime.$gte = start;
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
        query.startTime.$lte = end;
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

    // Get events
    const events = await Event.find(query)
      .populate('classId', 'name capacity')
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .sort({ startTime: -1 })
      .lean();

    const count = await Event.countDocuments(query);

    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
      data: events
    });
  } catch (error) {
    console.error('Error in getAllEvents:', error);
    next(error);
  }
};

// Get Single Event
exports.getEvent = async (req, res, next) => {
  try {
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid event ID format'
      });
    }

    const event = await Event.findById(req.params.id)
      .populate('classId', 'name capacity')
      .lean();
    
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Error in getEvent:', error);
    next(error);
  }
};

// Update Event
exports.updateEvent = async (req, res, next) => {
  try {
    // Validate event ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid event ID format'
      });
    }

    const { title, description, startTime, endTime, classId } = req.body;

    // Get existing event
    const existingEvent = await Event.findById(req.params.id);
    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
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

    // Validate time logic if both times are provided
    if (startTime !== undefined && endTime !== undefined) {
      const start = new Date(startTime);
      const end = new Date(endTime);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid date format'
        });
      }

      if (start >= end) {
        return res.status(400).json({
          success: false,
          error: 'End time must be after start time'
        });
      }

      updateData.startTime = start;
      updateData.endTime = end;
    } else if (startTime !== undefined) {
      // Only startTime provided, need to validate against existing endTime
      const start = new Date(startTime);
      if (isNaN(start.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid start time format'
        });
      }

      const existingEndTime = new Date(existingEvent.endTime);
      if (start >= existingEndTime) {
        return res.status(400).json({
          success: false,
          error: 'Start time must be before end time'
        });
      }

      updateData.startTime = start;
    } else if (endTime !== undefined) {
      // Only endTime provided, need to validate against existing startTime
      const end = new Date(endTime);
      if (isNaN(end.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid end time format'
        });
      }

      const existingStartTime = new Date(existingEvent.startTime);
      if (existingStartTime >= end) {
        return res.status(400).json({
          success: false,
          error: 'End time must be after start time'
        });
      }

      updateData.endTime = end;
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

    // Update event
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('classId', 'name capacity')
    .lean();

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Error in updateEvent:', error);
    
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

// Delete Event
exports.deleteEvent = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid event ID format'
      });
    }

    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error in deleteEvent:', error);
    next(error);
  }
};

