const mongoose = require('mongoose');
const { Schema } = mongoose;

const TripIntentSchema = new Schema({
  tripId: {
    type: Schema.Types.ObjectId,
    ref: 'TripBase',
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  priorities: [String],      // e.g., ["memories", "sightseeing", "relaxation"]
  vibes: [String],           // e.g., ["chill", "explore", "adventure"]
  mobility: [String],        // e.g., ["walk", "bike", "day trip"]
  budget: {
    type: String,            // e.g., "budget", "moderate", "splurge"
    default: "moderate",
  },
  travelPace: [String],      // e.g., ["Stay in one place", "Jump around"]
  anchorPrefs: [String],     // optional favorites (can be used later)
  logicScore: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('TripIntent', TripIntentSchema);
