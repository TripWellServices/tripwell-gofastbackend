const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

/**
 * POST /Tripwell/city-data
 * Saves parsed city data to Tripwell_content_library database
 */
router.post("/city-data", async (req, res) => {
  const { city, cityData } = req.body;

  // Validate input
  if (!city || !cityData) {
    return res.status(400).json({
      status: "error",
      message: "Missing required fields: city, cityData"
    });
  }

  // Validate cityData structure
  if (!cityData.pois || !cityData.restaurants || !cityData.transportation) {
    return res.status(400).json({
      status: "error",
      message: "cityData missing required arrays: pois, restaurants, transportation"
    });
  }

  try {
    // Create slug from city name
    const citySlug = city.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    // Connect to GoFastFamily database (consolidated for MVP1)
    const contentDb = mongoose.connection.useDb("GoFastFamily");

    // Prepare documents with common fields
    const commonFields = {
      citySlug,
      createdAt: new Date()
    };

    // Insert POIs
    const poisCollection = contentDb.collection("pois");
    const poisDocs = cityData.pois.map(poi => ({
      ...poi,
      ...commonFields
    }));
    const poisResult = await poisCollection.insertMany(poisDocs);

    // Insert Restaurants
    const restaurantsCollection = contentDb.collection("restaurants");
    const restaurantsDocs = cityData.restaurants.map(restaurant => ({
      ...restaurant,
      ...commonFields
    }));
    const restaurantsResult = await restaurantsCollection.insertMany(restaurantsDocs);

    // Insert Transportation
    const transportationCollection = contentDb.collection("transportation");
    const transportationDocs = cityData.transportation.map(transport => ({
      ...transport,
      ...commonFields
    }));
    const transportationResult = await transportationCollection.insertMany(transportationDocs);

    // Return success response
    res.status(200).json({
      status: "ok",
      city: city,
      counts: {
        pois: poisResult.insertedCount,
        restaurants: restaurantsResult.insertedCount,
        transportation: transportationResult.insertedCount
      }
    });

  } catch (error) {
    console.error("City data save error:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Internal server error"
    });
  }
});

module.exports = router;
