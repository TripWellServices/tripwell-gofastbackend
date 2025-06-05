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
  city: {                     // NEW top-level city field
    type: String,
  },
  destinations: {
    type: [DestinationSchema],
    default: []
  },
  destination: {              // OPTIONAL mirror field if you want
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to sync city and destination
TripBaseSchema.pre("save", function(next) {
  if (this.destinations?.length > 0 && this.destinations[0].city) {
    this.city = this.destinations[0].city;
  } else if (!this.city) {
    this.city = this.tripName || "Unknown";
  }

  // Mirror city to destination if desired
  this.destination = this.city;
  next();
});

module.exports = mongoose.model('TripBase', TripBaseSchema);
