const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

/**
 * POST /Tripwell/profile-save
 * Saves parsed profile data to Tripwell_itinerary_building database
 */
router.post("/profile-save", async (req, res) => {
  const { profileSlug, inputVariables, profileData } = req.body;

  // Validate input
  if (!profileSlug || !inputVariables || !profileData) {
    return res.status(400).json({
      status: "error",
      message: "Missing required fields: profileSlug, inputVariables, profileData"
    });
  }

  // Validate profileData structure
  if (!profileData.attractions || !profileData.restaurants || !profileData.mustSee || !profileData.mustDo) {
    return res.status(400).json({
      status: "error",
      message: "profileData missing required arrays: attractions, restaurants, mustSee, mustDo"
    });
  }

  try {
    // Connect to GoFastFamily database (consolidated for MVP1)
    const itineraryDb = mongoose.connection.useDb("GoFastFamily");

    // Create profile document
    const profileDoc = {
      profileSlug,
      inputVariables,
      createdAt: new Date(),
      angelaVersion: "gpt-4"
    };

    // Insert profile
    const profilesCollection = itineraryDb.collection("profiles");
    const profileResult = await profilesCollection.insertOne(profileDoc);
    const profileId = profileResult.insertedId;

    // Prepare documents with common fields
    const commonFields = {
      profileId,
      createdAt: new Date()
    };

    // Insert Attractions
    const attractionsCollection = itineraryDb.collection("attractions");
    const attractionsDocs = profileData.attractions.map(attraction => ({
      ...attraction,
      category: "attraction",
      ...commonFields
    }));
    const attractionsResult = await attractionsCollection.insertMany(attractionsDocs);

    // Insert Restaurants
    const restaurantsCollection = itineraryDb.collection("restaurants");
    const restaurantsDocs = profileData.restaurants.map(restaurant => ({
      ...restaurant,
      category: "restaurant",
      ...commonFields
    }));
    const restaurantsResult = await restaurantsCollection.insertMany(restaurantsDocs);

    // Insert Must See
    const mustSeeCollection = itineraryDb.collection("mustSee");
    const mustSeeDocs = profileData.mustSee.map(mustSee => ({
      ...mustSee,
      category: "mustSee",
      ...commonFields
    }));
    const mustSeeResult = await mustSeeCollection.insertMany(mustSeeDocs);

    // Insert Must Do
    const mustDoCollection = itineraryDb.collection("mustDo");
    const mustDoDocs = profileData.mustDo.map(mustDo => ({
      ...mustDo,
      category: "mustDo",
      ...commonFields
    }));
    const mustDoResult = await mustDoCollection.insertMany(mustDoDocs);

    // Return success response
    res.status(200).json({
      status: "ok",
      profileSlug: profileSlug,
      profileId: profileId,
      counts: {
        attractions: attractionsResult.insertedCount,
        restaurants: restaurantsResult.insertedCount,
        mustSee: mustSeeResult.insertedCount,
        mustDo: mustDoResult.insertedCount
      }
    });

  } catch (error) {
    console.error("Profile save error:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Internal server error"
    });
  }
});

module.exports = router;
