const mongoose = require('mongoose');

const UserSelectionsSchema = new mongoose.Schema({
  tripId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'TripBase', 
    required: true 
  },
  userId: { 
    type: String, 
    required: true 
  },
  
  // Meta attraction selections
  selectedMetas: [{
    name: { type: String, required: true },
    type: { type: String, required: true },
    reason: { type: String, required: true },
    selectedAt: { type: Date, default: Date.now }
  }],
  
  // Sample selections for persona learning
  selectedSamples: [{
    name: { type: String, required: true },
    type: { type: String, required: true },
    why_recommended: { type: String, required: true },
    selectedAt: { type: Date, default: Date.now }
  }],
  
  // Behavior tracking for prediction
  behaviorData: {
    totalSelections: { type: Number, default: 0 },
    metaPreferences: {
      art: { type: Number, default: 0 },
      foodie: { type: Number, default: 0 },
      adventure: { type: Number, default: 0 },
      history: { type: Number, default: 0 }
    },
    samplePreferences: {
      attraction: { type: Number, default: 0 },
      restaurant: { type: Number, default: 0 },
      neat_thing: { type: Number, default: 0 }
    },
    lastUpdated: { type: Date, default: Date.now }
  },
  
  // Status tracking
  status: { 
    type: String, 
    default: 'active',
    enum: ['active', 'completed', 'archived']
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update behavior data when selections change
UserSelectionsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Update behavior tracking
  this.behaviorData.totalSelections = this.selectedMetas.length + this.selectedSamples.length;
  
  // Update meta preferences based on selections
  this.selectedMetas.forEach(meta => {
    // Simple scoring - in production this could be more sophisticated
    if (meta.type.includes('art') || meta.name.toLowerCase().includes('museum')) {
      this.behaviorData.metaPreferences.art += 1;
    }
    if (meta.type.includes('food') || meta.name.toLowerCase().includes('restaurant')) {
      this.behaviorData.metaPreferences.foodie += 1;
    }
    if (meta.type.includes('adventure') || meta.name.toLowerCase().includes('park')) {
      this.behaviorData.metaPreferences.adventure += 1;
    }
    if (meta.type.includes('history') || meta.name.toLowerCase().includes('historic')) {
      this.behaviorData.metaPreferences.history += 1;
    }
  });
  
  // Update sample preferences
  this.selectedSamples.forEach(sample => {
    if (sample.type === 'attraction') {
      this.behaviorData.samplePreferences.attraction += 1;
    }
    if (sample.type === 'restaurant') {
      this.behaviorData.samplePreferences.restaurant += 1;
    }
    if (sample.type === 'neat_thing') {
      this.behaviorData.samplePreferences.neat_thing += 1;
    }
  });
  
  this.behaviorData.lastUpdated = new Date();
  next();
});

module.exports = mongoose.model('UserSelections', UserSelectionsSchema);
