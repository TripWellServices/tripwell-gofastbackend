const express = require("express");
const router = express.Router();
const { generatePlaceTodos } = require("../../services/TripWell/placetodoGPTService");
const { generateMetaAttractions } = require("../../services/TripWell/metaAttractionsService");
const { parsePlaceTodoData, validatePlaceTodoData, savePlaceTodoData } = require("../../services/TripWell/placetodoSaveService");

/**
 * POST /Tripwell/placetodo-gpt
 * Calls GPT to generate personalized place-specific todos based on user variables
 */
router.post("/placetodo-gpt", async (req, res) => {
  console.log("🎯 PLACE TODO ROUTE HIT! URL:", req.url);
  console.log("🎯 Body:", req.body);
  
  const { profileSlug, inputVariables } = req.body;

  // Validate input
  if (!profileSlug || !inputVariables) {
    return res.status(400).json({
      status: "error",
      message: "Missing required fields: profileSlug, inputVariables"
    });
  }

  try {
    console.log("🔍 Generating place todos for profile:", profileSlug);
    
    // Step 1: Generate MetaAttractions (obvious tourist traps to avoid)
    console.log("📋 Step 1: Generating meta attractions to avoid...");
    const metaAttractionsResult = await generateMetaAttractions({ 
      city: inputVariables.city, 
      season: inputVariables.season 
    });
    
    let metaAttractions;
    try {
      metaAttractions = JSON.parse(metaAttractionsResult.rawResponse);
      console.log("✅ Meta attractions generated:", metaAttractions.length);
    } catch (parseError) {
      console.error("❌ Failed to parse meta attractions:", parseError);
      metaAttractions = [];
    }
    
    // Step 2: Generate personalized content (avoiding meta attractions)
    console.log("🎯 Step 2: Generating personalized content...");
    const gptResult = await generatePlaceTodos({ 
      profileSlug, 
      inputVariables, 
      metaAttractions 
    });
    console.log("✅ GPT content generated");
    
    // Step 3: Parse the GPT response
    const parseResult = parsePlaceTodoData(gptResult.rawResponse);
    if (!parseResult.success) {
      throw new Error(`Failed to parse GPT response: ${parseResult.error}`);
    }
    console.log("✅ GPT response parsed");
    
    // Step 4: Validate the parsed data
    const validationResult = validatePlaceTodoData(parseResult.data);
    if (!validationResult.success) {
      throw new Error(`Validation failed: ${validationResult.error}`);
    }
    console.log("✅ Data validated");
    
    // Step 5: Save to database
    const saveResult = await savePlaceTodoData({
      profileSlug,
      inputVariables,
      parsedData: validationResult.data
    });
    console.log("✅ Data saved to database:", saveResult.placeTodoId);
    
    res.status(200).json({
      status: "success",
      message: "Place todos generated and saved successfully",
      profileSlug: profileSlug,
      placeTodoId: saveResult.placeTodoId
    });
    
  } catch (error) {
    console.error("🔥 Place Todo GPT Route Error:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to generate place todos"
    });
  }
});

module.exports = router;
