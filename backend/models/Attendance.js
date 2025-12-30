const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  present: {
    type: Boolean,
    required: true
  },
  studentId: {
    type: String,
    ref: 'Student',
    required: true
  },
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries
attendanceSchema.index({ studentId: 1 });
attendanceSchema.index({ lessonId: 1 });
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ studentId: 1, lessonId: 1 });
attendanceSchema.index({ studentId: 1, lessonId: 1, date: 1 }, { unique: true }); // Prevent duplicate attendance for same student, lesson, and date

module.exports = mongoose.model('Attendance', attendanceSchema);

