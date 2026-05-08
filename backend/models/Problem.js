const mongoose = require('mongoose');

const revisionScheduleSchema = new mongoose.Schema({
  day: { type: Number, required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'done', 'skipped'], default: 'pending' },
  confidence: { type: String, enum: ['Low', 'Medium', 'High', null], default: null }
});

const problemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  platform: { type: String, enum: ['LeetCode', 'GFG', 'Other'], required: true },
  url: { type: String },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  topics: [{ type: String }],
  approachNotes: { type: String },
  timeComplexity: { type: String },
  spaceComplexity: { type: String },
  solvedDate: { type: Date, default: Date.now },
  confidenceLevel: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
  revisionSchedule: [revisionScheduleSchema],
  isMastered: { type: Boolean, default: false },
  consecutiveSkips: { type: Number, default: 0 }
});

module.exports = mongoose.model('Problem', problemSchema);
