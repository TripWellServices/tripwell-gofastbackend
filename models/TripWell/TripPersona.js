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
  
  // Budget (from user input)
  budget: { 
    type: Number, 
    required: true,
    min: 0
  },
  
  // Travel pace (from user selection)
  travelPace: { 
    type: String, 
    required: true,
    enum: ['tons', 'moderate', 'slow']
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
TripPersonaSchema.pre('save', async function(next) {
  try {
    // Set primary persona weight to 0.6, others to 0.1
    this.personas = { art: 0.1, foodie: 0.1, adventure: 0.1, history: 0.1 };
    this.personas[this.primaryPersona] = 0.6;
    
    // Get whoWith from TripBase (we need to populate this)
    const TripBase = mongoose.model('TripBase');
    const trip = await TripBase.findById(this.tripId);
    const whoWith = trip ? trip.whoWith : 'solo'; // fallback
    
    // Calculate conditional weights based on whoWith + budget + primaryPersona + travelPace
    const { budget, travelPace, primaryPersona } = this;
    
    // Base weights by whoWith
    let baseWeights = {
      solo: { romance: 0.2, caretaker: 0.1, flexibility: 0.2, adult: 0.5 },
      couple: { romance: 0.4, caretaker: 0.1, flexibility: 0.2, adult: 0.3 },
      family: { romance: 0.1, caretaker: 0.6, flexibility: 0.1, adult: 0.2 },
      friends: { romance: 0.1, caretaker: 0.1, flexibility: 0.3, adult: 0.5 }
    };
    
    // Adjust based on budget (categorize the number)
    let budgetCategory = 'moderate';
    if (budget < 150) budgetCategory = 'low';
    else if (budget > 300) budgetCategory = 'high';
    
    const budgetMultiplier = {
      low: 0.8,
      moderate: 1.0,
      high: 1.2
    };
    
    // Adjust based on travel pace
    const paceMultiplier = {
      tons: 1.2,    // More action = higher weights
      moderate: 1.0,
      slow: 0.8     // Slower pace = lower weights
    };
    
    // Adjust based on primary persona
    const personaAdjustments = {
      art: { romance: 0.1, adult: 0.1 },
      foodie: { romance: 0.1, adult: 0.2 },
      adventure: { romance: -0.1, adult: 0.1 },
      history: { romance: 0.0, adult: 0.0 }
    };
    
    const base = baseWeights[whoWith];
    const budgetMult = budgetMultiplier[budgetCategory];
    const paceMult = paceMultiplier[travelPace];
    const adjustment = personaAdjustments[primaryPersona];
    
    // Apply calculations (ensure weights stay between 0 and 1)
    this.romanceLevel = Math.max(0, Math.min(1, (base.romance + adjustment.romance) * budgetMult * paceMult));
    this.caretakerRole = Math.max(0, Math.min(1, base.caretaker * budgetMult * paceMult));
    this.flexibility = Math.max(0, Math.min(1, base.flexibility * budgetMult * paceMult));
    this.adultLevel = Math.max(0, Math.min(1, (base.adult + adjustment.adult) * budgetMult * paceMult));
    
    this.updatedAt = new Date();
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('TripPersona', TripPersonaSchema);
