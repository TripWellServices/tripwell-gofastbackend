const express = require("express");
const router = express.Router();
const { parseAndSaveMetaAttractions } = require("../../services/TripWell/metaParseAndSaveService");

/**
 * POST /tripwell/meta-parse-and-save
 * Parses and saves meta attractions to database
 * This is the second step - takes raw GPT response and saves it
 */
router.post("/meta-parse-and-save", async (req, res) => {
  console.log("🎯 META PARSE AND SAVE ROUTE HIT!");
  console.log("🎯 Body:", req.body);
  
  const { placeSlug, city, season, rawResponse } = req.body;

  // Validate input
  if (!placeSlug || !city || !season || !rawResponse) {
    return res.status(400).json({
      status: "error",
      message: "Missing required fields: placeSlug, city, season, rawResponse"
    });
  }

  try {
    console.log("🔄 Parsing and saving meta attractions...");
    
    const result = await parseAndSaveMetaAttractions({
      placeSlug,
      city,
      season,
      rawResponse
    });

    if (!result.success) {
      return res.status(500).json({
        status: "error",
        message: "Failed to parse and save meta attractions",
        error: result.error
      });
    }

    console.log("✅ Meta attractions parsed and saved successfully");
    
    return res.status(200).json({
      status: "success",
      message: "Meta attractions parsed and saved successfully",
      metaAttractionsId: result.metaAttractionsId,
      metaAttractions: result.metaAttractions,
      placeSlug,
      city,
      season
    });

  } catch (error) {
    console.error("❌ Meta parse and save error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to parse and save meta attractions",
      error: error.message
    });
  }
});

module.exports = router;
