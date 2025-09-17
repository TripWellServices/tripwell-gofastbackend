const express = require("express");
const router = express.Router();
const TripPersona = require("../../models/TripWell/TripPersona");
const { generatePersonaSamples } = require("../../services/TripWell/personaSamplesService");

/**
 * POST /tripwell/persona-samples
 * Generate persona-based samples for user learning
 */
router.post("/persona-samples", async (req, res) => {
  console.log("🎯 PERSONA SAMPLES ROUTE HIT!");
  console.log("🎯 Body:", req.body);
  
  const { tripId, userId, city, personas, budget, whoWith } = req.body;

  if (!tripId || !userId || !city || !personas || !budget || !whoWith) {
    return res.status(400).json({
      status: "error",
      message: "Missing required fields: tripId, userId, city, personas, budget, whoWith"
    });
  }

  try {
    console.log("📋 Generating persona samples for:", city);
    
    // Generate samples using OpenAI
    const samples = await generatePersonaSamples(city, personas, budget, whoWith);
    
    console.log("✅ Persona samples generated:", {
      attractions: samples.attractions?.length || 0,
      restaurants: samples.restaurants?.length || 0,
      neatThings: samples.neatThings?.length || 0
    });
    
    res.json({
      status: "success",
      message: "Persona samples generated successfully",
      tripId,
      userId,
      samples: samples,
      nextStep: "User selects samples, then call persona-sample-service"
    });
    
  } catch (error) {
    console.error("❌ Persona samples generation failed:", error);
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
});

/**
 * POST /tripwell/persona-sample-service
 * Update persona weights based on user sample selections
 */
router.post("/persona-sample-service", async (req, res) => {
  console.log("🎯 PERSONA SAMPLE SERVICE ROUTE HIT!");
  console.log("🎯 Body:", req.body);
  
  const { tripId, userId, selectedSamples, currentPersonas } = req.body;

  if (!tripId || !userId || !selectedSamples || !currentPersonas) {
    return res.status(400).json({
      status: "error",
      message: "Missing required fields: tripId, userId, selectedSamples, currentPersonas"
    });
  }

  try {
    console.log("📋 Updating persona weights based on selections:", selectedSamples);
    
    // Find the TripPersona document
    let tripPersona = await TripPersona.findOne({ tripId, userId });
    if (!tripPersona) {
      return res.status(404).json({
        status: "error",
        message: "TripPersona not found"
      });
    }
    
    // For now, we'll use a simple weight adjustment based on selections
    // In the future, this could call the updatePersonaWeights service with OpenAI
    const updatedPersonas = { ...currentPersonas };
    
    // Simple logic: if user selected samples, slightly boost those persona weights
    // This is a placeholder - the real logic would use OpenAI analysis
    if (selectedSamples.length > 0) {
      // Boost the primary persona slightly
      const primaryPersona = Object.keys(updatedPersonas).find(key => updatedPersonas[key] === 0.6);
      if (primaryPersona) {
        updatedPersonas[primaryPersona] = Math.min(0.7, updatedPersonas[primaryPersona] + 0.05);
        // Reduce others slightly to maintain sum of 1.0
        Object.keys(updatedPersonas).forEach(key => {
          if (key !== primaryPersona) {
            updatedPersonas[key] = Math.max(0.05, updatedPersonas[key] - 0.02);
          }
        });
      }
    }
    
    // Update the TripPersona document
    tripPersona.personas = updatedPersonas;
    tripPersona.status = 'samples_processed';
    await tripPersona.save();
    
    console.log("✅ Persona weights updated:", updatedPersonas);
    
    res.json({
      status: "success",
      message: "Persona weights updated successfully",
      tripId,
      userId,
      updatedPersona: tripPersona,
      nextStep: "Call build list service with updated weights"
    });
    
  } catch (error) {
    console.error("❌ Persona weight update failed:", error);
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
});

module.exports = router;
