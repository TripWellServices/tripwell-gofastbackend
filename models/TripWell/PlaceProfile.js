const mongoose = require('mongoose');

const PlaceProfileSchema = new mongoose.Schema({
  placeSlug: { type: String, required: true, unique: true },
  cityId: { type: mongoose.Schema.Types.ObjectId, ref: 'City', required: true },
  cityName: { type: String, required: true }, // Keep for easy queries
  season: { type: String, required: true },
  purpose: { type: String },
  whoWith: { type: String, required: true },
  priorities: [String],
  vibes: [String],
  mobility: [String],
  travelPace: [String],
  budget: { type: String },
  status: { type: String, default: 'profile_saved' }, // profile_saved, meta_generated, content_built
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PlaceProfile', PlaceProfileSchema);
