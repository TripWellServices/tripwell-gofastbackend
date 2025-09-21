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

// Pre-save middleware removed - values are set directly in the route

module.exports = mongoose.model('TripPersona', TripPersonaSchema);
