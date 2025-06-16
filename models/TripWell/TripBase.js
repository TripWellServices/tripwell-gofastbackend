const mongoose = require('mongoose');

const DestinationSchema = new mongoose.Schema({
  locationId: { type: String, required: true, unique: true },
  city: { type: String, required: true },
  startDate: Date,
  endDate: Date,
  notes: String
}, { _id: false });

const TripBaseSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // 🔥 Required - hydrated via /whoami
  joinCode: { type: String, required: true, unique: true },
  tripName: { type: String, required: true },
  purpose: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isMultiCity: { type: Boolean, default: false },
  city: { type: String }, // top-level city
  destinations: { type: [DestinationSchema], default: [] },
  destination: { type: String }, // mirror of city
  partyCount: { type: Number, default: 1 }, // 👥 party size
  whoWith: { type: [String], default: [] }, // 👨‍👩‍👧‍👦 checkbox inputs
  createdAt: { type: Date, default: Date.now }
});

TripBaseSchema.pre("save", function(next) {
  if (this.destinations?.length > 0 && this.destinations[0].city) {
    this.city = this.destinations[0].city;
  } else if (!this.city) {
    this.city = this.tripName || "Unknown";
  }

  this.destination = this.city;
  next();
});

module.exports = mongoose.model('TripBase', TripBaseSchema);
