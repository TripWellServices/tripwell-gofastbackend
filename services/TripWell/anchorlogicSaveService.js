const mongoose = require("mongoose");
const TripPersona = require("../../models/TripWell/TripPersona");

async function savePersonaSamples(tripId, userId, selectedSamples) {
  if (!tripId || !userId) throw new Error("Missing tripId or userId");

  if (!Array.isArray(selectedSamples) || selectedSamples.length === 0) {
    throw new Error("Must include at least one selected sample");
  }

  const tripObjectId = new mongoose.Types.ObjectId(tripId);

  // Find existing TripPersona or create new one
  let tripPersona = await TripPersona.findOne({ tripId: tripObjectId, userId });
  
  if (!tripPersona) {
    throw new Error("TripPersona not found. Please complete the trip intent form first.");
  }

  // Update persona weights based on selected samples
  // This is where the "secret sauce" happens - we learn from user choices
  const updatedPersona = await updatePersonaWeightsFromSamples(tripPersona, selectedSamples);

  return updatedPersona;
}

// 🧠 Secret sauce: Update persona weights based on user sample selections
async function updatePersonaWeightsFromSamples(tripPersona, selectedSamples) {
  // Simple learning algorithm - in production this could be more sophisticated
  const learningRate = 0.1; // How much to adjust weights
  
  // Count selections by type
  const typeCounts = selectedSamples.reduce((acc, sample) => {
    acc[sample.type] = (acc[sample.type] || 0) + 1;
    return acc;
  }, {});

  // Adjust weights based on selections
  const adjustments = {
    attraction: { art: 0.05, adventure: 0.05, history: 0.05, foodie: -0.02 },
    restaurant: { foodie: 0.1, art: 0.02, adventure: -0.02, history: 0.02 },
    neat_thing: { adventure: 0.05, art: 0.03, foodie: 0.02, history: 0.03 }
  };

  // Apply adjustments
  Object.keys(typeCounts).forEach(type => {
    const count = typeCounts[type];
    const adjustment = adjustments[type];
    
    if (adjustment) {
      Object.keys(adjustment).forEach(persona => {
        tripPersona.personas[persona] += adjustment[persona] * count * learningRate;
        // Keep weights between 0 and 1
        tripPersona.personas[persona] = Math.max(0, Math.min(1, tripPersona.personas[persona]));
      });
    }
  });

  // Normalize weights to ensure they add up to 1.0
  const totalWeight = Object.values(tripPersona.personas).reduce((sum, weight) => sum + weight, 0);
  Object.keys(tripPersona.personas).forEach(persona => {
    tripPersona.personas[persona] = tripPersona.personas[persona] / totalWeight;
  });

  // Save updated persona
  await tripPersona.save();
  
  console.log("🧠 Updated persona weights:", tripPersona.personas);
  return tripPersona;
}

module.exports = { savePersonaSamples };
