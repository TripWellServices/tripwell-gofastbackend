// models/TripWell/TripLocation.js
const mongoose = require('mongoose');

const TripLocationSchema = new mongoose.Schema({
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TripBase',
    required: true,
  },
  destination: {
    type: String,
    required: true,
  },
  lat: Number,
  lon: Number,
  neighborhood: String,
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('TripLocation', TripLocationSchema);
