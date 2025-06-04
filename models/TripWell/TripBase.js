const mongoose = require('mongoose');

const DestinationSchema = new mongoose.Schema({
  locationId: {
    type: String,
    required: true,
    unique: true,
  },
  city: {
    type: String,
    required: true,
  },
  startDate: Date,
  endDate: Date,
  notes: String
}, { _id: false });

const TripBaseSchema = new mongoose.Schema({
  joinCode: {
    type: String,
    required: true,
    unique: true
  },
  tripName: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isMultiCity: {
    type: Boolean,
    default: false
  },
  destinations: {
    type: [DestinationSchema],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('TripBase', TripBaseSchema);
