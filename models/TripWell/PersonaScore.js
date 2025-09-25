// models/TripWell/PersonaScore.js
const mongoose = require("mongoose");

/*
  PersonaScore Schema — User Decision Weights
  
  ✅ Individual fields for easy querying and mutation:
    - Query: "Find all Art people" → personaScores.Art > 0.5
    - Track changes: "Has Art rating grown?" → Compare Art values over time
    - Mutate: "Run persona shift service" → Update individual values
    - Hydrate: "Get Art value" → user.personaScores.Art (just the number)
  
  ✅ Service calculates weights, model just stores the results
  ✅ Never hardcoded - all values come from service calculation
*/

const personaScoreSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'TripWellUser',
    required: true,
    unique: true
  },
  
  // Persona response possibilities - individual fields for easy querying
  personaScores: {
    Art: { type: Number, default: null },
    Food: { type: Number, default: null },
    History: { type: Number, default: null },
    Adventure: { type: Number, default: null }
  },
  
  // Planning style response possibilities - individual fields for easy querying
  planningScores: {
    Spontaneous: { type: Number, default: null },
    "Mix of spontaneous and planned": { type: Number, default: null },
    "Set a plan and stick to it!": { type: Number, default: null }
  },
  
  // Metadata
  calculatedAt: { type: Date, default: Date.now },
  calculationVersion: { type: String, default: "1.0" }
}, { timestamps: true });

// Indexes for fast querying
personaScoreSchema.index({ userId: 1 });
personaScoreSchema.index({ "personaScores.Art": 1 });
personaScoreSchema.index({ "personaScores.Food": 1 });
personaScoreSchema.index({ "personaScores.History": 1 });
personaScoreSchema.index({ "personaScores.Adventure": 1 });

module.exports = mongoose.model("PersonaScore", personaScoreSchema);
