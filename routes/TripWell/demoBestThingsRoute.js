// routes/TripWell/demoBestThingsRoute.js
const express = require("express");
const router = express.Router();
const { generateDemoBestThings } = require("../../services/TripWell/gptDemoBestThingsService");
const TripWellUser = require("../../models/TripWellUser");
const TripBase = require("../../models/TripWell/TripBase");
const verifyFirebaseToken = require("../../middleware/verifyFirebaseToken");

/**
 * POST /tripwell/demo/bestthings
 * Generate demo best things recommendations (no auth required)
 */
router.post("/bestthings", async (req, res) => {
  try {
    const { destination, category, budget } = req.body;

    // Validate required fields
    if (!destination) {
      return res.status(400).json({ error: "Destination is required" });
    }

    // Validate category
    const validCategories = ["all", "food", "culture", "nature", "nightlife"];
    if (category && !validCategories.includes(category)) {
      return res.status(400).json({ error: "Invalid category" });
    }

    // Validate budget
    const validBudgets = ["low", "medium", "high"];
    if (budget && !validBudgets.includes(budget)) {
      return res.status(400).json({ error: "Invalid budget level" });
    }

    console.log(`🎯 Generating demo best things for ${destination} (${category}, ${budget})`);

    // Generate best things recommendations
    const bestThingsData = await generateDemoBestThings({
      destination,
      category: category || "all",
      budget: budget || "medium"
    });

    console.log(`✅ Demo best things generated for ${destination}`);

    res.json(bestThingsData);

  } catch (error) {
    console.error("❌ Demo best things generation error:", error);
    res.status(500).json({ error: "Failed to generate best things recommendations" });
  }
});

/**
 * POST /tripwell/demo/bestthings/save
 * Save demo best things data with user info (auth required)
 */
router.post("/bestthings/save", verifyFirebaseToken, async (req, res) => {
  try {
    const { firebaseId, email, destination, category, budget, bestThingsData } = req.body;

    // Validate required fields
    if (!firebaseId || !email || !destination || !bestThingsData) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    console.log(`💾 Saving demo best things for user ${email} (${destination})`);

    // Create or find user with funnelStage = "spots_demo"
    let user = await TripWellUser.findOne({ firebaseId });
    
    if (!user) {
      user = new TripWellUser({
        firebaseId,
        email,
        funnelStage: "spots_demo",
        profileComplete: false
      });
    } else {
      // Update existing user's funnel stage
      user.funnelStage = "spots_demo";
    }

    await user.save();

    // Create a demo trip setup with best things data
    const tripSetup = new TripBase({
      tripName: `Best of ${destination}`,
      purpose: "Demo - Best things to do",
      city: destination,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      joinCode: `BEST_${Date.now()}`,
      partyCount: 1,
      whoWith: ["solo"]
      // Note: bestThingsData field removed as TripBase doesn't support it
    });

    await tripSetup.save();

    console.log(`✅ Demo best things saved for user ${email}`);

    res.json({
      success: true,
      message: "Demo best things saved successfully",
      tripSetup: tripSetup
    });

  } catch (error) {
    console.error("❌ Demo best things save error:", error);
    res.status(500).json({ error: "Failed to save demo best things" });
  }
});

module.exports = router;
