const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    default: null
  }
}, {
  timestamps: true
});

// Index for faster queries
announcementSchema.index({ classId: 1 });
announcementSchema.index({ date: 1 });
announcementSchema.index({ classId: 1, date: 1 });

module.exports = mongoose.model('Announcement', announcementSchema);

