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
  destination: {             // <--- add this field
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add hook to mirror city to destination before save
TripBaseSchema.pre("save", function(next) {
  const firstDest = this.destinations?.[0];
  this.destination = firstDest?.city || this.tripName || "Unknown";
  next();
});

module.exports = mongoose.model('TripBase', TripBaseSchema);
