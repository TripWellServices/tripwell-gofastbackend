const express = require("express");
const router = express.Router();
const { getAllPlaceTodos } = require("../../services/TripWell/placetodoSaveService");

/**
 * GET /Tripwell/place-library
 * Get all saved place profiles grouped by city
 */
router.get("/place-library", async (req, res) => {
  console.log("🎯 PLACE LIBRARY ROUTE HIT!");
  
  try {
    console.log("🔍 Fetching all place todos...");
    const placeTodos = await getAllPlaceTodos();
    console.log("✅ Found place todos:", placeTodos.length);
    
    // Group by city
    const placesMap = {};
    
    placeTodos.forEach(placeTodo => {
      const city = placeTodo.city;
      
      if (!placesMap[city]) {
        placesMap[city] = {
          city: city,
          profiles: []
        };
      }
      
      placesMap[city].profiles.push({
        slug: placeTodo.profileSlug,
        budget: placeTodo.budget,
        whoWith: placeTodo.whoWith,
        priorities: placeTodo.priorities,
        vibes: placeTodo.vibes,
        season: placeTodo.season,
        purpose: placeTodo.purpose,
        createdAt: placeTodo.createdAt
      });
    });
    
    // Convert to array
    const places = Object.values(placesMap);
    
    console.log("✅ Returning places:", places.length);
    res.status(200).json(places);
    
  } catch (error) {
    console.error("🔥 Place Library Route Error:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to fetch place library"
    });
  }
});

module.exports = router;
