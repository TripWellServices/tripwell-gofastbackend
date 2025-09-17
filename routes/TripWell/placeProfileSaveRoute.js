const express = require("express");
const router = express.Router();
const PlaceProfile = require("../../models/TripWell/PlaceProfile");
const { getOrCreateCity } = require("../../services/TripWell/parseCityService");

/**
 * POST /tripwell/place-profile-save
 * Saves the initial place + profile data to database
 * This is the first step in the separate call flow
 */

router.post("/place-profile-save", async (req, res) => {
  console.log("🎯 PLACE PROFILE SAVE ROUTE HIT!");
  console.log("🎯 Body:", req.body);
  
  const { placeSlug, inputVariables } = req.body;

  // Validate input
  if (!placeSlug || !inputVariables) {
    return res.status(400).json({
      status: "error",
      message: "Missing required fields: placeSlug, inputVariables"
    });
  }

  try {
    console.log("💾 Saving place profile to database...");
    
    // Step 1: Parse and save city
    const cityName = inputVariables.city;
    let cityProfile = await CityProfile.findOne({ cityName });
    if (!cityProfile) {
      cityProfile = new CityProfile({
        cityName,
        country: "Unknown" // TODO: Add country detection
      });
      await cityProfile.save();
      console.log("✅ City profile created:", cityName);
    } else {
      console.log("✅ City profile found:", cityName);
    }
    
    // Step 2: Create new place profile with city reference
    const newPlaceProfile = new PlaceProfile({
      placeSlug,
      cityId: cityProfile._id,
      cityName: cityName,
      season: inputVariables.season,
      purpose: inputVariables.purpose,
      whoWith: inputVariables.whoWith,
      priorities: inputVariables.priorities,
      vibes: inputVariables.vibes,
      mobility: inputVariables.mobility,
      travelPace: inputVariables.travelPace,
      budget: inputVariables.budget,
      status: 'profile_saved'
    });

    await newPlaceProfile.save();
    console.log("✅ Place profile saved:", newPlaceProfile._id);
    
    res.status(200).json({
      status: "success",
      message: "Place profile saved successfully",
      placeSlug: placeSlug,
      placeProfileId: newPlaceProfile._id,
      cityId: cityProfile._id,
      cityName: cityName,
      nextStep: "Call meta attractions service"
    });
    
  } catch (error) {
    console.error("🔥 Place Profile Save Error:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to save place profile"
    });
  }
});

module.exports = router;
