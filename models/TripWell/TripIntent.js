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
  priorities: [String],
  vibes: [String],
  mobility: [String],
  budget: {
    type: String, // Keep string if you're using descriptive values ("moderate", etc)
    default: "moderate",
  },
  travelPace: [String], // ✅ NEW
  anchorPrefs: [String],
  logicScore: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});
