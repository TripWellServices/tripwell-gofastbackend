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
  
  // Calculated weights (from service)
  personaWeights: {
    art: { type: Number, default: null },
    foodie: { type: Number, default: null },
    adventure: { type: Number, default: null },
    history: { type: Number, default: null }
  },
  
  budgetLevel: { type: Number, default: null },
  
  spacingWeights: {
    relaxed: { type: Number, default: null },
    balanced: { type: Number, default: null },
    packed: { type: Number, default: null }
  },
  
  // Metadata
  calculatedAt: { type: Date, default: null },
  calculationVersion: { type: String, default: "1.0" },
  
  // Status tracking
  status: { type: String, default: 'created' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TripPersona', TripPersonaSchema);
