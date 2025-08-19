const mongoose = require("mongoose");

const TripExtraSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Firebase ID
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: "TripBase", required: true },
  
  // Validation state - what's missing
  missingData: {
    type: [String],
    default: [],
    enum: ["user", "trip", "tripIntent", "anchorLogic", "tripDays", "validation_error"]
  },
  
  // Detailed validation results
  validationResults: {
    user: {
      exists: { type: Boolean, default: false },
      profileComplete: { type: Boolean, default: false },
      hasName: { type: Boolean, default: false },
      hasHometown: { type: Boolean, default: false }
    },
    trip: {
      exists: { type: Boolean, default: false },
      hasName: { type: Boolean, default: false },
      hasCity: { type: Boolean, default: false },
      hasDates: { type: Boolean, default: false },
      hasPurpose: { type: Boolean, default: false },
      hasWhoWith: { type: Boolean, default: false },
      hasSeason: { type: Boolean, default: false },
      hasDaysTotal: { type: Boolean, default: false }
    },
    tripIntent: {
      exists: { type: Boolean, default: false },
      hasPriorities: { type: Boolean, default: false },
      hasVibes: { type: Boolean, default: false },
      hasMobility: { type: Boolean, default: false },
      hasTravelPace: { type: Boolean, default: false },
      hasBudget: { type: Boolean, default: false }
    },
    anchorLogic: {
      exists: { type: Boolean, default: false },
      hasAnchors: { type: Boolean, default: false }
    },
    tripDays: {
      exists: { type: Boolean, default: false },
      count: { type: Number, default: 0 },
      hasSummaries: { type: Boolean, default: false },
      expectedCount: { type: Number, default: 0 }
    }
  },
  
  // Quick access flags
  isValid: { type: Boolean, default: false },
  lastValidated: { type: Date, default: Date.now }
}, { timestamps: true });

// Index for quick lookups
TripExtraSchema.index({ userId: 1, tripId: 1 }, { unique: true });

// Instance method to check if specific data is missing
TripExtraSchema.methods.isMissing = function(dataType) {
  return this.missingData.includes(dataType);
};

// Instance method to get validation summary
TripExtraSchema.methods.getSummary = function() {
  if (this.isValid) {
    return ["✅ All data present and valid"];
  }
  
  const summary = [];
  if (this.isMissing("user")) summary.push("❌ User not found in database");
  if (this.isMissing("trip")) summary.push("❌ Trip data missing");
  if (this.isMissing("tripIntent")) summary.push("❌ Trip intent data missing (priorities, vibes, etc.)");
  if (this.isMissing("anchorLogic")) summary.push("❌ Anchor selection data missing");
  if (this.isMissing("tripDays")) summary.push("❌ Trip itinerary days missing");
  
  return summary;
};

// Static method to find or create TripExtra for user
TripExtraSchema.statics.findOrCreateForUser = async function(userId, tripId) {
  let tripExtra = await this.findOne({ userId, tripId });
  
  if (!tripExtra) {
    tripExtra = new this({
      userId,
      tripId,
      isValid: false,
      missingData: ["user", "trip", "tripIntent", "anchorLogic", "tripDays"] // Assume everything missing initially
    });
  }
  
  return tripExtra;
};

module.exports = mongoose.model("TripExtra", TripExtraSchema);
