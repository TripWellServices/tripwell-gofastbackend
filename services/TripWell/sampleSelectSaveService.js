const mongoose = require("mongoose");
const TripLLMReady = require("../../models/TripWell/TripLLMReady");
const { updateLLMReadyData } = require("../llmHydrateService");

async function savePersonaSamples(tripId, userId, selectedSamples) {
  if (!tripId || !userId) throw new Error("Missing tripId or userId");

  if (!Array.isArray(selectedSamples) || selectedSamples.length === 0) {
    throw new Error("Must include at least one selected sample");
  }

  console.log(`💾 Saving ${selectedSamples.length} selected samples...`);

  // 🚀 SAVE SELECTED SAMPLES TO TRIPLLMREADY MODEL!
  await updateLLMReadyData(tripId, {
    sampleSelects: selectedSamples.map(sample => ({
      type: sample.type,
      name: sample.name,
      description: sample.description || "",
      whyRecommended: sample.why_recommended || "",
      selectedAt: new Date()
    }))
  });

  console.log(`✅ Saved ${selectedSamples.length} selected samples to TripLLMReady`);

  return { success: true, samplesSaved: selectedSamples.length };
}

// ✅ SIMPLE! Just save the selections to TripLLMReady model!

module.exports = { savePersonaSamples };
