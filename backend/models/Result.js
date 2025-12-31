const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  score: {
    type: Number,
    required: true,
    min: [0, 'Score cannot be negative'],
    max: [100, 'Score cannot exceed 100']
  },
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    default: null
  },
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    default: null
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  }
}, {
  timestamps: true
});

// Custom validation: examId va assignmentId validatsiyasi
resultSchema.pre('validate', function(next) {
  // Kamida bittasi bo'lishi kerak
  if (!this.examId && !this.assignmentId) {
    return next(new Error('Either examId or assignmentId must be provided'));
  }
  
  // Ikkalasi ham bo'lmasligi kerak
  if (this.examId && this.assignmentId) {
    return next(new Error('Result cannot be associated with both exam and assignment. Please provide only one.'));
  }
  
  next();
});

// Index for faster queries
resultSchema.index({ studentId: 1 });
resultSchema.index({ examId: 1 });
resultSchema.index({ assignmentId: 1 });
resultSchema.index({ studentId: 1, examId: 1 });
resultSchema.index({ studentId: 1, assignmentId: 1 });

module.exports = mongoose.model('Result', resultSchema);

