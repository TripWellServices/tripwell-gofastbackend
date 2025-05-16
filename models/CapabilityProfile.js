const mongoose = require('mongoose');

const CapabilityProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  currentAvgPace: String,
  sustainableDistance: Number,
  peakingState: String,
  baseMileage: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CapabilityProfile', CapabilityProfileSchema);
