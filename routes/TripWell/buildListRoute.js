const express = require("express");
const router = express.Router();
const { generatePlaceTodos } = require("../../services/TripWell/placetodoGPTService");
const { parsePlaceTodoData, validatePlaceTodoData, savePlaceTodoData } = require("../../services/TripWell/placetodoSaveService");
const mongoose = require('mongoose');

/**
 * POST /tripwell/build-list
 * Takes everything (place profile + meta attractions) and builds the final list
 * This is the third step in the separate call flow
 */

// Get models
const PlaceProfile = mongoose.model('PlaceProfile');
const MetaAttractions = mongoose.model('MetaAttractions');

router.post("/build-list", async (req, res) => {
  console.log("🎯 BUILD LIST ROUTE HIT!");
  console.log("🎯 Body:", req.body);
  
  const { placeSlug } = req.body;

  // Validate input
  if (!placeSlug) {
    return res.status(400).json({
      status: "error",
      message: "Missing required field: placeSlug"
    });
  }

  try {
    console.log("🔍 Building list for placeSlug:", placeSlug);
    
    // Step 1: Get place profile from database
    console.log("📋 Step 1: Fetching place profile...");
    const placeProfile = await PlaceProfile.findOne({ placeSlug });
    if (!placeProfile) {
      throw new Error("Place profile not found. Run place-profile-save first.");
    }
    console.log("✅ Place profile found:", placeProfile._id);
    
    // Step 2: Get meta attractions from database
    console.log("📋 Step 2: Fetching meta attractions...");
    const metaAttractions = await MetaAttractions.findOne({ placeSlug });
    if (!metaAttractions) {
      throw new Error("Meta attractions not found. Run meta-attractions first.");
    }
    console.log("✅ Meta attractions found:", metaAttractions.metaAttractions.length);
    
    // Step 3: Build input variables from place profile
    const inputVariables = {
      city: placeProfile.city,
      season: placeProfile.season,
      purpose: placeProfile.purpose,
      whoWith: placeProfile.whoWith,
      priorities: placeProfile.priorities,
      vibes: placeProfile.vibes,
      mobility: placeProfile.mobility,
      travelPace: placeProfile.travelPace,
      budget: placeProfile.budget
    };
    
    // Step 4: Generate personalized content (avoiding meta attractions)
    console.log("🎯 Step 3: Generating personalized content...");
    const gptResult = await generatePlaceTodos({ 
      profileSlug: placeSlug, 
      inputVariables, 
      metaAttractions: metaAttractions.metaAttractions 
    });
    console.log("✅ GPT content generated");
    
    // Step 5: Parse the GPT response
    const parseResult = parsePlaceTodoData(gptResult.rawResponse);
    if (!parseResult.success) {
      throw new Error(`Failed to parse GPT response: ${parseResult.error}`);
    }
    console.log("✅ GPT response parsed");
    
    // Step 6: Validate the parsed data
    const validationResult = validatePlaceTodoData(parseResult.data);
    if (!validationResult.success) {
      throw new Error(`Validation failed: ${validationResult.error}`);
    }
    console.log("✅ Data validated");
    
    // Step 7: Save final content to database
    const saveResult = await savePlaceTodoData({
      profileSlug: placeSlug,
      inputVariables,
      parsedData: validationResult.data
    });
    console.log("✅ Final content saved to database:", saveResult.placeTodoId);
    
    // Step 8: Update place profile status
    placeProfile.status = 'content_built';
    placeProfile.updatedAt = new Date();
    await placeProfile.save();
    console.log("✅ Place profile status updated to content_built");
    
    res.status(200).json({
      status: "success",
      message: "List built successfully",
      placeSlug: placeSlug,
      placeTodoId: saveResult.placeTodoId,
      metaAttractionsAvoided: metaAttractions.metaAttractions.length,
      contentGenerated: {
        attractions: validationResult.data.attractions?.length || 0,
        restaurants: validationResult.data.restaurants?.length || 0,
        mustSee: validationResult.data.mustSee?.length || 0,
        mustDo: validationResult.data.mustDo?.length || 0
      }
    });
    
  } catch (error) {
    console.error("🔥 Build List Error:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to build list"
    });
  }
});

module.exports = router;
