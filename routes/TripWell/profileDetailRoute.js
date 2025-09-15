const express = require("express");
const router = express.Router();
const { getPlaceTodoBySlug } = require("../../services/TripWell/placetodoSaveService");

/**
 * GET /Tripwell/place-detail/:profileSlug
 * Get detailed place content by slug
 */
router.get("/place-detail/:profileSlug", async (req, res) => {
  console.log("🎯 PROFILE DETAIL ROUTE HIT!");
  console.log("🎯 Profile slug:", req.params.profileSlug);
  
  const { profileSlug } = req.params;
  
  try {
    console.log("🔍 Fetching profile:", profileSlug);
    const placeTodo = await getPlaceTodoBySlug(profileSlug);
    
    if (!placeTodo) {
      return res.status(404).json({
        status: "error",
        message: "Profile not found"
      });
    }
    
    console.log("✅ Profile found:", placeTodo.profileSlug);
    
    // Format the response
    const profile = {
      slug: placeTodo.profileSlug,
      inputVariables: {
        city: placeTodo.city,
        season: placeTodo.season,
        purpose: placeTodo.purpose,
        whoWith: placeTodo.whoWith,
        priorities: placeTodo.priorities,
        vibes: placeTodo.vibes,
        mobility: placeTodo.mobility,
        travelPace: placeTodo.travelPace,
        budget: placeTodo.budget
      }
    };
    
    const content = {
      attractions: placeTodo.attractions || [],
      restaurants: placeTodo.restaurants || [],
      mustSee: placeTodo.mustSee || [],
      mustDo: placeTodo.mustDo || []
    };
    
    res.status(200).json({
      status: "success",
      profile: profile,
      content: content
    });
    
  } catch (error) {
    console.error("🔥 Profile Detail Route Error:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to fetch profile details"
    });
  }
});

module.exports = router;
