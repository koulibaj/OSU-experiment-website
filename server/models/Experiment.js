const mongoose = require('mongoose');

const ExperimentSchema = new mongoose.Schema({
  name: String,
  description: String,
  status: { type: String, default: 'paused' },
  startTime: Date,
  endTime: Date,
  duration: Number, // seconds
  estimatedTime: Number,
  notes: [String]
}, { timestamps: true });

module.exports = mongoose.model('Experiment', ExperimentSchema);