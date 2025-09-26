const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

/*
  TripLLMReady Model
  
  ✅ ONE MODEL with everything for OpenAI
  ✅ No more bouncing between TripBase, TripPersona, etc.
  ✅ Converter service pushes clean strings here
  ✅ SmartPrompt service draws from this ONE source of truth
  ✅ Clean, consolidated, LLM-ready data
*/

const TripLLMReadySchema = new mongoose.Schema({
  tripId: { 
    type: ObjectId, 
    ref: 'TripBase', 
    required: true,
    unique: true
  },
  userId: { 
    type: ObjectId, 
    ref: 'TripWellUser', 
    required: true 
  },
  
  // Trip days (from ItineraryDays)
  tripDays: [{
    dayIndex: { type: Number, required: true },
    summary: { type: String, default: "" },
    blocks: {
      morning: { type: String, default: "" },
      afternoon: { type: String, default: "" },
      evening: { type: String, default: "" }
    }
  }],
  
  // Trip context (from TripBase)
  season: { type: String, required: true },
  whoWith: { type: String, default: "friends" }, // Literal string from TripBase
  purpose: { type: String, default: "to enjoy and explore" },
  city: { type: String, required: true },
  country: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  daysTotal: { type: Number, required: true },
  
  // LLM-ready strings (from converter service)
  tripPersonaLLM: { 
    type: String, 
    default: "" 
  }, // "Someone who is fascinated by the past, heritage..."
  
  tripBudgetLLM: { 
    type: String, 
    default: "" 
  }, // "mid-range traveler, looking for quality experiences..."
  
  tripSpacingLLM: { 
    type: String, 
    default: "" 
  }, // "prefers a balanced itinerary with a good mix..."
  
  // Meta picks (just IDs for now)
  metaPickIds: [{ 
    type: ObjectId, 
    ref: 'MetaAttraction' 
  }],
  
  // Sample selects (save for MVP2 analysis)
  sampleSelects: [{
    type: { 
      type: String, 
      enum: ["attraction", "restaurant", "neatThing"],
      required: true 
    },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    whyRecommended: { type: String, default: "" },
    selectedAt: { type: Date, default: Date.now }
  }],
  
  // Analysis results (from percentage services) - just for tracking
  personaConfidence: { type: Number, default: null },
  budgetConfidence: { type: Number, default: null },
  
  // Status tracking
  status: { 
    type: String, 
    default: 'building',
    enum: ['building', 'ready', 'used']
  },
  
  // Metadata
  builtAt: { type: Date, default: Date.now },
  readyAt: { type: Date, default: null },
  usedAt: { type: Date, default: null }
}, { timestamps: true });

// Indexes for performance
TripLLMReadySchema.index({ tripId: 1 });
TripLLMReadySchema.index({ userId: 1 });
TripLLMReadySchema.index({ status: 1 });

// Query helpers
TripLLMReadySchema.statics.findByTripId = function(tripId) {
  return this.findOne({ tripId }).populate('metaPickIds');
};

TripLLMReadySchema.statics.findByUserId = function(userId) {
  return this.find({ userId }).populate('metaPickIds');
};

TripLLMReadySchema.statics.findReady = function() {
  return this.find({ status: 'ready' }).populate('metaPickIds');
};


module.exports = mongoose.model('TripLLMReady', TripLLMReadySchema);
