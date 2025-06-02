const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ['user','admin'],
    default: 'user'
  },

    // ─── NEW FIELDS FOR EMAIL CONFIRMATION ─────────────────────
  isVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String },
  emailVerificationExpires: { type: Date },
  resetPasswordToken: String,
  resetPasswordExpires: Date,

  
    status: { type: String, enum: ['active','banned'], default: 'active' },
    isDemo: { type: Boolean, default: false },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
