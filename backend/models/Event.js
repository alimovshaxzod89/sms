const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
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
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true,
    validate: {
      validator: function(value) {
        return value > this.startTime;
      },
      message: 'End time must be after start time'
    }
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
eventSchema.index({ classId: 1 });
eventSchema.index({ startTime: 1 });
eventSchema.index({ endTime: 1 });
eventSchema.index({ classId: 1, startTime: 1 });

module.exports = mongoose.model('Event', eventSchema);

