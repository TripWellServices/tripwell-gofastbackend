const mongoose = require('mongoose');

const CityStuffToDoSchema = new mongoose.Schema({
  cityId: { 
    type: String, 
    required: true,
    index: true 
  },
  season: { 
    type: String, 
    required: true,
    enum: ['spring', 'summer', 'fall', 'winter', 'any']
  },
  samples: {
    attractions: [{
      id: String,
      name: String,
      description: String
    }],
    restaurants: [{
      id: String,
      name: String,
      description: String
    }],
    neatThings: [{
      id: String,
      name: String,
      description: String
    }]
  },
  metadata: {
    persona_weights: {
      art: Number,
      foodie: Number,
      adventure: Number,
      history: Number
    },
    budget_level: Number,
    romance_level: Number,
    caretaker_role: Number,
    flexibility: Number,
    who_with: String,
    daily_spacing: Number,
    season: String,
    purpose: String,
    budget: Number
  },
  prompt: String, // Store the full prompt for debugging
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index for efficient city + season lookups
CityStuffToDoSchema.index({ cityId: 1, season: 1 });

module.exports = mongoose.model('CityStuffToDo', CityStuffToDoSchema);
