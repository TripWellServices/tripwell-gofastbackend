const mongoose = require('mongoose');

const TripPersonaSchema = new mongoose.Schema({
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'TripBase', required: true },
  userId: { type: String, required: true },
  
  // Primary persona (from user selection)
  primaryPersona: { 
    type: String, 
    required: true,
    enum: ['art', 'foodie', 'adventure', 'history']
  },
  
  // Budget (from user selection)
  budget: { 
    type: String, 
    required: true,
    enum: ['low', 'moderate', 'high']
  },
  
  // Who with (from user selection)
  whoWith: { 
    type: String, 
    required: true,
    enum: ['solo', 'couple', 'family', 'friends']
  },
  
  // Calculated weights based on conditional logic (backend secret sauce)
  personas: {
    art: { type: Number, default: 0.1 },
    foodie: { type: Number, default: 0.1 },
    adventure: { type: Number, default: 0.1 },
    history: { type: Number, default: 0.1 }
  },
  
  // Calculated weights based on whoWith + budget + primaryPersona
  romanceLevel: { type: Number, default: 0.0 }, // 0.0 to 1.0
  caretakerRole: { type: Number, default: 0.0 }, // 0.0 to 1.0
  flexibility: { type: Number, default: 0.0 }, // 0.0 to 1.0
  adultLevel: { type: Number, default: 0.0 }, // 0.0 to 1.0
  
  // Status tracking
  status: { type: String, default: 'created' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Pre-save middleware to calculate weights based on conditional logic
TripPersonaSchema.pre('save', function(next) {
  // Set primary persona weight to 0.6, others to 0.1
  this.personas = { art: 0.1, foodie: 0.1, adventure: 0.1, history: 0.1 };
  this.personas[this.primaryPersona] = 0.6;
  
  // Calculate conditional weights based on whoWith + budget + primaryPersona
  const { whoWith, budget, primaryPersona } = this;
  
  // Base weights by whoWith
  let baseWeights = {
    solo: { romance: 0.2, caretaker: 0.1, flexibility: 0.2, adult: 0.5 },
    couple: { romance: 0.4, caretaker: 0.1, flexibility: 0.2, adult: 0.3 },
    family: { romance: 0.1, caretaker: 0.6, flexibility: 0.1, adult: 0.2 },
    friends: { romance: 0.1, caretaker: 0.1, flexibility: 0.3, adult: 0.5 }
  };
  
  // Adjust based on budget
  const budgetMultiplier = {
    low: 0.8,
    moderate: 1.0,
    high: 1.2
  };
  
  // Adjust based on primary persona
  const personaAdjustments = {
    art: { romance: 0.1, adult: 0.1 },
    foodie: { romance: 0.1, adult: 0.2 },
    adventure: { romance: -0.1, adult: 0.1 },
    history: { romance: 0.0, adult: 0.0 }
  };
  
  const base = baseWeights[whoWith];
  const multiplier = budgetMultiplier[budget];
  const adjustment = personaAdjustments[primaryPersona];
  
  // Apply calculations (ensure weights stay between 0 and 1)
  this.romanceLevel = Math.max(0, Math.min(1, (base.romance + adjustment.romance) * multiplier));
  this.caretakerRole = Math.max(0, Math.min(1, base.caretaker * multiplier));
  this.flexibility = Math.max(0, Math.min(1, base.flexibility * multiplier));
  this.adultLevel = Math.max(0, Math.min(1, (base.adult + adjustment.adult) * multiplier));
  
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('TripPersona', TripPersonaSchema);
