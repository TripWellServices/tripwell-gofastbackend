const express = require("express");
const router = express.Router();
const { generateMetaAttractions } = require("../../services/TripWell/metaAttractionsService");
const { parseAndSaveMetaAttractions } = require("../../services/TripWell/metaParseAndSaveService");

/**
 * POST /tripwell/meta-attractions
 * Generates meta attractions and saves them to database
 * This is the second step in the separate call flow
 */

router.post("/meta-attractions", async (req, res) => {
  console.log("🎯 META ATTRACTIONS ROUTE HIT!");
  console.log("🎯 Body:", req.body);
  
  const { placeSlug, city, season } = req.body;

  // Validate input
  if (!placeSlug || !city || !season) {
    return res.status(400).json({
      status: "error",
      message: "Missing required fields: placeSlug, city, season"
    });
  }

  try {
    console.log("📋 Generating meta attractions for:", city, season);
    
    // Step 1: Generate meta attractions
    const metaAttractionsResult = await generateMetaAttractions({ city, season });
    console.log("✅ GPT meta attractions generated");
    
    // Step 2: Parse and save using the dedicated service
    const result = await parseAndSaveMetaAttractions({
      placeSlug,
      city,
      season,
      rawResponse: metaAttractionsResult.rawResponse
    });
    
    if (!result.success) {
      throw new Error(result.error);
    }
    
    res.json({
      status: "success",
      message: result.message,
      placeSlug,
      metaAttractionsId: result.metaAttractionsId,
      metaAttractions: result.metaAttractions,
      nextStep: "Call build list service"
    });
    
  } catch (error) {
    console.error("❌ Meta attractions generation failed:", error);
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
});

module.exports = router;