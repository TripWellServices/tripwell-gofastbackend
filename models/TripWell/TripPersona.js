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
  
  // Budget level (numeric field)
  budgetLevel: { type: Number, default: undefined },
  
  // Status tracking
  status: { type: String, default: 'created' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TripPersona', TripPersonaSchema);
