const express = require("express");
const router = express.Router();
const City = require("../../models/TripWell/City");
const MetaAttractions = require("../../models/TripWell/MetaAttractions");
const { getOrCreateCity } = require("../../services/TripWell/parseCityService");

/**
 * POST /tripwell/parse-city
 * Parse city string and save to content library (Tripwell_itinerary_building database)
 */
router.post("/parse-city", async (req, res) => {
  try {
    const { tripId, city } = req.body;
    
    if (!tripId && !city) {
      return res.status(400).json({
        status: "error",
        message: "Either tripId or city is required"
      });
    }
    
    let cityToParse = city;
    
    // If tripId provided, find TripBase and extract city from trip data
    if (tripId) {
      console.log("🗺️ Finding TripBase:", tripId);
      const TripBase = require("../../models/TripWell/TripBase");
      const trip = await TripBase.findById(tripId);
      
      if (!trip) {
        return res.status(404).json({
          status: "error",
          message: "Trip not found"
        });
      }
      
      console.log("✅ Trip found:", trip.tripName);
      console.log("🏙️ City from trip:", trip.city);
      
      // Use city from TripBase
      cityToParse = trip.city || city || "Unknown";
      console.log("🏙️ Using city from TripBase:", cityToParse);
    }
    
    console.log("🏙️ Parsing city:", cityToParse);
    
    // Use the parseCityService to get or create city
    const cityDoc = await getOrCreateCity(cityToParse);
    
    res.json({
      status: "success",
      message: "City parsed and saved to content library",
      city: {
        cityId: cityDoc._id,
        cityName: cityDoc.cityName,
        country: cityDoc.country,
        status: cityDoc.status,
        createdAt: cityDoc.createdAt
      },
      database: "Tripwell_itinerary_building",
      collection: "cities",
      source: tripId ? "tripbase_data" : "direct_input"
    });
    
  } catch (error) {
    console.error("❌ City parser failed:", error);
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
});

/**
 * GET /tripwell/content-library/status
 * Check what's in the content library
 */
router.get("/content-library/status", async (req, res) => {
  try {
    console.log("📚 Checking content library status...");
    
    // Get all cities
    const cities = await City.find({}).sort({ createdAt: -1 });
    
    // Get meta attractions count by city
    const metaAttractionsByCity = await MetaAttractions.aggregate([
      {
        $group: {
          _id: "$cityName",
          count: { $sum: 1 },
          seasons: { $addToSet: "$season" },
          lastUpdated: { $max: "$createdAt" }
        }
      },
      {
        $sort: { lastUpdated: -1 }
      }
    ]);
    
    res.json({
      status: "success",
      message: "Content library status",
      summary: {
        totalCities: cities.length,
        totalMetaAttractions: metaAttractionsByCity.length,
        cities: cities.map(city => ({
          cityId: city._id,
          cityName: city.cityName,
          country: city.country,
          status: city.status,
          createdAt: city.createdAt
        })),
        metaAttractions: metaAttractionsByCity.map(item => ({
          cityName: item._id,
          count: item.count,
          seasons: item.seasons,
          lastUpdated: item.lastUpdated
        }))
      }
    });
    
  } catch (error) {
    console.error("❌ Content library status check failed:", error);
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
});

/**
 * GET /tripwell/content-library/city/:cityName
 * Get all content for a specific city
 */
router.get("/content-library/city/:cityName", async (req, res) => {
  try {
    const { cityName } = req.params;
    console.log("📚 Getting content for city:", cityName);
    
    // Get city
    const city = await City.findOne({ cityName });
    if (!city) {
      return res.status(404).json({
        status: "error",
        message: "City not found in content library"
      });
    }
    
    // Get all meta attractions for this city
    const metaAttractions = await MetaAttractions.find({ cityId: city._id }).sort({ season: 1 });
    
    res.json({
      status: "success",
      message: `Content library for ${cityName}`,
      city: {
        cityId: city._id,
        cityName: city.cityName,
        country: city.country,
        status: city.status,
        createdAt: city.createdAt
      },
      metaAttractions: metaAttractions.map(meta => ({
        metaAttractionsId: meta._id,
        season: meta.season,
        count: meta.metaAttractions.length,
        attractions: meta.metaAttractions,
        createdAt: meta.createdAt
      }))
    });
    
  } catch (error) {
    console.error("❌ Content library city check failed:", error);
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
});

module.exports = router;
