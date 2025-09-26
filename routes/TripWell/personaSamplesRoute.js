const express = require("express");
const router = express.Router();
const PersonaCityIdeas = require("../../models/TripWell/PersonaCityIdeas");
const SampleSelects = require("../../models/TripWell/SampleSelects");
const { generatePersonaSamples } = require("../../services/TripWell/sampleSelectService");

// ✅ PROMPT BUILDING MOVED TO SERVICE - NO DUPLICATE CODE!

/**
 * POST /tripwell/persona-samples
 * Generate persona-based samples using LLM-ready data
 */
router.post("/persona-samples", async (req, res) => {
  console.log("🎯 PERSONA SAMPLES ROUTE HIT!");
  console.log("🎯 Body:", req.body);
  
  const { tripId, userId } = req.body;

  if (!tripId || !userId) {
    return res.status(400).json({
      status: "error",
      message: "Missing required fields: tripId, userId"
    });
  }

  try {
    console.log("📋 Getting persona samples for trip:", tripId);
    
    // Get LLM-ready data (ONE source of truth)
    const llmData = await getLLMReadyData(tripId);
    
    const cityId = llmData.cityId || llmData.city;
    const season = llmData.season || "any";
    
    console.log("🔍 Checking for existing samples:", { cityId, season });
    
    // Step 1: Check if samples already exist for this city/season
    let existingSamples = await PersonaCityIdeas.findOne({ cityId, season });
    
    if (existingSamples) {
      console.log("✅ Found existing samples for city:", cityId);
      return res.json({
        status: "success",
        message: "Existing samples loaded",
        tripId,
        userId,
        samples: existingSamples.samples,
        metadata: existingSamples.metadata,
        sampleObjectId: existingSamples._id,
        source: "existing"
      });
    }
    
    console.log("🆕 No existing samples found, generating new ones...");
    
    // Step 2: Generate samples using the service (NO MORE INLINE GPT!)
    console.log("🤖 Calling sampleSelectService...");
    
    const result = await generatePersonaSamples({ tripId, userId });
    const samplesData = result.samples;
    
    console.log("✅ Samples generated via service:", {
      attractions: samplesData.attractions?.length || 0,
      restaurants: samplesData.restaurants?.length || 0,
      neatThings: samplesData.neatThings?.length || 0
    });
    
    // Step 4: Save samples to PersonaCityIdeas collection
    const personaCityIdeas = await PersonaCityIdeas.create({
      cityId,
      season,
      samples: samplesData,
      metadata: {
        tripId,
        userId,
        dominantPersona: llmData.dominantPersona,
        dominantBudget: llmData.dominantBudget,
        generatedAt: new Date()
      },
      prompt: prompt
    });
    
    console.log("💾 Samples saved to PersonaCityIdeas:", personaCityIdeas._id);
    
    res.json({
      status: "success",
      message: "Persona samples generated and saved successfully",
      tripId,
      userId,
      samples: samplesData,
      metadata: {
        tripId,
        userId,
        dominantPersona: llmData.dominantPersona,
        dominantBudget: llmData.dominantBudget,
        generatedAt: new Date()
      },
      sampleObjectId: personaCityIdeas._id,
      source: "generated",
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
 * GET /tripwell/persona-samples/:cityId/:season
 * Hydrate existing samples for a city/season (fast lookup)
 */
router.get("/persona-samples/:cityId/:season", async (req, res) => {
  const { cityId, season } = req.params;
  
  console.log("🔍 Hydrating samples for:", { cityId, season });

  try {
    const existingSamples = await CityStuffToDo.findOne({ cityId, season });
    
    if (existingSamples) {
      console.log("✅ Found existing samples for city:", cityId);
      return res.json({
        status: "success",
        message: "Existing samples loaded",
        cityId,
        season,
        samples: existingSamples.samples,
        metadata: existingSamples.metadata,
        sampleObjectId: existingSamples._id,
        source: "hydrated"
      });
    } else {
      console.log("❌ No existing samples found for:", { cityId, season });
      return res.json({
        status: "success",
        message: "No existing samples found",
        cityId,
        season,
        samples: null,
        source: "not_found"
      });
    }
  } catch (error) {
    console.error("❌ Sample hydration failed:", error);
    return res.status(500).json({
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
  
  const { tripId, userId, selectedSamples, sampleObjectId, cityId } = req.body;

  if (!tripId || !userId || !selectedSamples || !sampleObjectId || !cityId) {
    return res.status(400).json({
      status: "error",
      message: "Missing required fields: tripId, userId, selectedSamples, sampleObjectId, cityId"
    });
  }

  try {
    console.log("💾 Saving user sample selections:", {
      tripId,
      userId,
      selectedSamples: selectedSamples.length,
      sampleObjectId,
      cityId
    });

    // Save user selections to SampleSelects collection
    const sampleSelection = await SampleSelects.create({
      sampleObjectId,
      tripId,
      cityId,
      userId,
      selectedSamples
    });

    console.log("✅ Sample selections saved:", sampleSelection._id);

    res.json({
      status: "success",
      message: "Sample selections saved successfully",
      tripId,
      userId,
      sampleSelectionId: sampleSelection._id,
      selectedCount: selectedSamples.length,
      nextStep: "Use selections for itinerary generation"
    });

  } catch (error) {
    console.error("❌ Sample selection save failed:", error);
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
});

module.exports = router;
