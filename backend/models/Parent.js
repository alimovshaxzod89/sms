const mongoose = require('mongoose');

const parentSchema = new mongoose.Schema({
  id: {
    type: String,
    required: [true, 'ID is required'],
    unique: true,
    trim: true,
    index: true
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username cannot exceed 20 characters'],
    trim: true,
    lowercase: true,
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false // Don't include password in queries by default
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  surname: {
    type: String,
    required: [true, 'Surname is required'],
    trim: true,
    minlength: [2, 'Surname must be at least 2 characters'],
    maxlength: [50, 'Surname cannot exceed 50 characters']
  },
  email: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple null values
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address']
  },
  phone: {
    type: String,
    required: [true, 'Phone is required'],
    unique: true,
    trim: true,
    match: [/^\+?[1-9]\d{1,14}$/, 'Please provide a valid phone number']
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    minlength: [5, 'Address must be at least 5 characters'],
    maxlength: [200, 'Address cannot exceed 200 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for common queries
parentSchema.index({ name: 1, surname: 1 });
parentSchema.index({ createdAt: -1 });

// Text index for search functionality
parentSchema.index({ 
  name: 'text', 
  surname: 'text', 
  username: 'text',
  email: 'text'
});

// Virtual for students
parentSchema.virtual('students', {
  ref: 'Student',
  localField: 'id',
  foreignField: 'parentId'
});

// Virtual for full name
parentSchema.virtual('fullName').get(function() {
  return `${this.name} ${this.surname}`;
});

// Pre-save middleware: Auto-lowercase username
parentSchema.pre('save', function(next) {
  if (this.isModified('username')) {
    this.username = this.username.toLowerCase();
  }
  next();
});

// Instance method: Compare passwords
parentSchema.methods.comparePassword = async function(candidatePassword) {
  const bcrypt = require('bcryptjs');
  // Need to explicitly select password since it's not selected by default
  const parent = await this.constructor.findById(this._id).select('+password');
  return await bcrypt.compare(candidatePassword, parent.password);
};

// Instance method: Get public profile (safe for external use)
parentSchema.methods.getPublicProfile = function() {
  return {
    id: this.id,
    name: this.name,
    surname: this.surname,
    fullName: this.fullName,
    email: this.email,
    phone: this.phone
  };
};

// Static method: Search parents
parentSchema.statics.search = function(searchTerm) {
  return this.find(
    { $text: { $search: searchTerm } },
    { score: { $meta: 'textScore' } }
  )
  .sort({ score: { $meta: 'textScore' } })
  .select('-password');
};

// Exclude password and sensitive data from JSON response
parentSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Parent', parentSchema);