// models/TripWell/TripBase.js
const mongoose = require('mongoose');

const TripBaseSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  purpose: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('TripBase', TripBaseSchema);
