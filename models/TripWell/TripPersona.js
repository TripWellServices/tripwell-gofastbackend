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
  
  // Daily spacing (from user selection)
  dailySpacing: { 
    type: Number, 
    required: true,
    min: 0,
    max: 1
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
    
    // Calculate conditional weights based on whoWith + budget + primaryPersona + dailySpacing
    const { budget, dailySpacing, primaryPersona } = this;
    
    // Base weights by whoWith
    let baseWeights = {
      solo: { romance: 0.2, caretaker: 0.1, flexibility: 0.2, adult: 0.5 },
      couple: { romance: 0.4, caretaker: 0.1, flexibility: 0.2, adult: 0.3 },
      family: { romance: 0.1, caretaker: 0.6, flexibility: 0.1, adult: 0.2 },
      friends: { romance: 0.1, caretaker: 0.1, flexibility: 0.3, adult: 0.5 }
    };
    
    // Calculate budget score (0.1 to 1.0+ based on actual dollar amount)
    // $50 = 0.1, $200 = 0.5, $400 = 1.0, $1000 = 2.0
    const budgetScore = Math.max(0.1, Math.min(2.0, budget / 400));
    
    // Adjust based on daily spacing (numeric value: 0.2=light, 0.5=moderate, 0.8=packed)
    const spacingMultiplier = dailySpacing; // Use the numeric value directly
    
    // Adjust based on primary persona
    const personaAdjustments = {
      art: { romance: 0.1, adult: 0.1 },
      foodie: { romance: 0.1, adult: 0.2 },
      adventure: { romance: -0.1, adult: 0.1 },
      history: { romance: 0.0, adult: 0.0 }
    };
    
    const base = baseWeights[whoWith];
    const spacingMult = spacingMultiplier;
    const adjustment = personaAdjustments[primaryPersona];
    
    // Apply calculations using budget score (can go above 1.0 for high budgets)
    this.romanceLevel = Math.max(0, (base.romance + adjustment.romance) * budgetScore * spacingMult);
    this.caretakerRole = Math.max(0, base.caretaker * budgetScore * spacingMult);
    this.flexibility = Math.max(0, base.flexibility * budgetScore * spacingMult);
    this.adultLevel = Math.max(0, (base.adult + adjustment.adult) * budgetScore * spacingMult);
    
    this.updatedAt = new Date();
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('TripPersona', TripPersonaSchema);
