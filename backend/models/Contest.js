const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  startTime: { type: Date, required: true },
  platform: { type: String, default: 'LeetCode' },
  url: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Contest', contestSchema);
