const mongoose = require('mongoose');

const summarySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
 input: {
    type: String,
    required: function() { 
      return this.inputType === 'text'; // Only require for text inputs
    }
  },
  input: {
    type: String,   // raw text, URL, or PDF filename/ref
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
