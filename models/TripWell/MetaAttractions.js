const mongoose = require('mongoose');

const MetaAttractionsSchema = new mongoose.Schema({
  cityId: { type: mongoose.Schema.Types.ObjectId, ref: 'City', required: true },
  cityName: { type: String, required: true }, // Keep for easy queries
  season: { type: String, required: true },
  metaAttractions: [{
    name: { type: String, required: true },
    type: { type: String, required: true },
    reason: { type: String, required: true }
  }],
  status: { type: String, default: 'meta_generated' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MetaAttractions', MetaAttractionsSchema);
