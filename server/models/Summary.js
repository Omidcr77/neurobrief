// /server/models/Summary.js

const mongoose = require("mongoose");

const summaryOptionsSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["abstractive", "extractive"],
    default: "abstractive",
  },
  length: {
    type: String,
    enum: ["short", "medium", "long"],
    default: "medium",
  },
  focus: {
    type: String,
    default: "",
  },
});

const summarySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  inputType: {
    type: String,
    enum: ["text", "pdf", "url"],
    required: true,
  },
  input: {
    type: String,
    required: true,
  },
  summaryOptions: {
    type: summaryOptionsSchema,
    default: () => ({}),
  },
  summary: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Summary", summarySchema);
