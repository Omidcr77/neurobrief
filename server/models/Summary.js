const mongoose = require('mongoose');

const summarySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // NEW: inputType must be one of 'text', 'pdf', or 'url'
  // This is what your frontend is expecting when it does item.inputType
  inputType: {
    type: String,
    enum: ['text', 'pdf', 'url'],
    required: true
  },

  // only one `input` field (no duplicate). This stores either:
  //  • raw text (if inputType === 'text')
  //  • a URL string  (if inputType === 'url')
  //  • the PDF filename or reference (if inputType === 'pdf')
  input: {
    type: String,
    required: true
  },

  summary: {
    type: String,
    required: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Summary', summarySchema);
