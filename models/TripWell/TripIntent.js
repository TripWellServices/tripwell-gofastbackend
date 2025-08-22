const mongoose = require("mongoose");

const TripIntentSchema = new mongoose.Schema({
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: "TripBase", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "TripWellUser", required: true }, // ObjectId is canon
  priorities: { 
    type: [String], 
    default: [],
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.every(item => typeof item === 'string' && item.trim().length > 0);
      },
      message: 'Priorities must be an array of non-empty strings'
    }
  },
  vibes: { 
    type: [String], 
    default: [],
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.every(item => typeof item === 'string' && item.trim().length > 0);
      },
      message: 'Vibes must be an array of non-empty strings'
    }
  },
  mobility: { 
    type: [String], 
    default: [],
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.every(item => typeof item === 'string' && item.trim().length > 0);
      },
      message: 'Mobility must be an array of non-empty strings'
    }
  },
  travelPace: { 
    type: [String], 
    default: [],
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.every(item => typeof item === 'string' && item.trim().length > 0);
      },
      message: 'TravelPace must be an array of non-empty strings'
    }
  },
  budget: { 
    type: String, 
    default: "",
    trim: true
  }
}, { timestamps: true });

TripIntentSchema.index({ tripId: 1, userId: 1 }, { unique: true });

// Instance method to check if TripIntent has meaningful data
TripIntentSchema.methods.hasMeaningfulData = function() {
  return (this.priorities && this.priorities.length > 0) ||
         (this.vibes && this.vibes.length > 0) ||
         (this.mobility && this.mobility.length > 0) ||
         (this.travelPace && this.travelPace.length > 0) ||
         (this.budget && this.budget.trim().length > 0);
};

// Static method to find TripIntent with meaningful data
TripIntentSchema.statics.findWithData = function(criteria) {
  return this.find({
    ...criteria,
    $or: [
      { priorities: { $exists: true, $ne: [], $not: { $size: 0 } } },
      { vibes: { $exists: true, $ne: [], $not: { $size: 0 } } },
      { mobility: { $exists: true, $ne: [], $not: { $size: 0 } } },
      { travelPace: { $exists: true, $ne: [], $not: { $size: 0 } } },
      { budget: { $exists: true, $ne: "", $not: { $regex: /^\s*$/ } } }
    ]
  });
};

module.exports = mongoose.model("TripIntent", TripIntentSchema);
