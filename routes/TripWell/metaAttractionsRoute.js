const express = require("express");
const router = express.Router();
const MetaAttractions = require("../../models/TripWell/MetaAttractions");
const City = require("../../models/TripWell/City");
const { generateMetaAttractions } = require("../../services/TripWell/metaAttractionsService");

/**
 * GET /tripwell/meta-attractions/:cityId/:season
 * Fast lookup of existing meta attractions from database
 * No auth needed - just a content library lookup
 */

router.get("/meta-attractions/:cityId/:season", async (req, res) => {
  const { cityId, season } = req.params;
  
  console.log("🎯 FAST META LOOKUP:", { cityId, season });

  try {
    // Simple fast lookup - no generation, just return what exists
    const metaAttractions = await MetaAttractions.findOne({ cityId, season });
    
    if (metaAttractions && metaAttractions.metaAttractions) {
      console.log("✅ Meta attractions found:", metaAttractions.metaAttractions.length);
      return res.json({
        status: "success",
        message: "Meta attractions loaded",
        cityId,
        metaAttractionsId: metaAttractions._id,
        metaAttractions: metaAttractions.metaAttractions,
        source: "fast_lookup"
      });
    } else {
      console.log("❌ No meta attractions found for:", { cityId, season });
      return res.json({
        status: "success",
        message: "No meta attractions found",
        cityId,
        metaAttractions: [],
        source: "fast_lookup_empty"
      });
    }
  } catch (error) {
    console.error("❌ Fast meta lookup failed:", error);
    return res.status(500).json({
      status: "error",
      message: "Fast lookup failed: " + error.message
    });
  }
});

/**
 * POST /tripwell/meta-attractions (LEGACY - KEEP FOR NOW)
 * Hydrates existing meta attractions from database
 * Meta attractions should already exist (generated during city creation)
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
    console.log("📋 Building content library for:", city, season);
    
    // Step 1: Get city from model
    const cityDoc = await City.findOne({ cityName: city });
    if (!cityDoc) {
      return res.status(404).json({
        status: "error",
        message: "City not found in database. City should be created during trip setup.",
        cityName: city
      });
    }
    console.log("✅ City found:", cityDoc.cityName, cityDoc._id);
    
    // Step 2: Check if meta attractions already exist
    let metaAttractions = await MetaAttractions.findOne({ cityId: cityDoc._id, season });
    if (metaAttractions) {
      console.log("✅ Meta attractions found for city:", cityDoc.cityName);
      return res.json({
        status: "success",
        message: "Meta attractions loaded",
        cityId: cityDoc._id,
        metaAttractionsId: metaAttractions._id,
        metaAttractions: metaAttractions.metaAttractions,
        source: "content_library",
        nextStep: "Call build list service"
      });
    }
    
    // Step 3: If no meta attractions found, generate them now
    console.log("🔄 No meta attractions found, generating now...");
    const result = await generateMetaAttractions(cityDoc._id, cityDoc.cityName, season);
    
    return res.json({
      status: "success",
      message: "Meta attractions generated and saved",
      cityId: cityDoc._id,
      metaAttractionsId: result.metaAttractionsId,
      metaAttractions: result.data,
      source: "generated_now",
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