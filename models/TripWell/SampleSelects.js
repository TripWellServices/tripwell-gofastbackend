const mongoose = require('mongoose');

const SampleSelectsSchema = new mongoose.Schema({
  sampleObjectId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'PersonaCityIdeas', 
    required: true 
  },
  tripId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'TripBase', 
    required: true 
  },
  cityId: { 
    type: String, 
    required: true,
    index: true 
  },
  userId: { 
    type: String, 
    required: true 
  },
  selectedSamples: [{
    type: String, // Sample ID (e.g., "attr_1", "rest_2", "neat_3")
    required: true
  }],
  createdAt: { type: Date, default: Date.now }
});

// Index for efficient queries
SampleSelectsSchema.index({ tripId: 1, userId: 1 });
SampleSelectsSchema.index({ cityId: 1 });

module.exports = mongoose.model('SampleSelects', SampleSelectsSchema);
