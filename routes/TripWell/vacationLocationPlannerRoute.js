// routes/TripWell/vacationLocationPlannerRoute.js
const express = require("express");
const router = express.Router();
const { generateVacationLocationRecommendations } = require("../../services/TripWell/gptVacationLocationPlannerService");
const TripWellUser = require("../../models/TripWell/TripWellUser");
const TripBase = require("../../models/TripWell/TripBase");
const verifyFirebaseToken = require("../../middleware/verifyFirebaseToken");

/**
 * POST /tripwell/demo/vacation-planner
 * Generate vacation location recommendations (no auth required)
 */
router.post("/vacation-planner", async (req, res) => {
  try {
    const { 
      numDays, 
      vibes, 
      whoWith, 
      startingLocation, 
      preferences, 
      budget 
    } = req.body;

    // Validate required fields
    if (!numDays || !vibes || !whoWith || !startingLocation || !preferences || !budget) {
      return res.status(400).json({ 
        error: "Missing required fields: numDays, vibes, whoWith, startingLocation, preferences, budget" 
      });
    }

    // Validate numDays
    if (numDays < 1 || numDays > 30) {
      return res.status(400).json({ 
        error: "numDays must be between 1 and 30" 
      });
    }

    // Validate arrays
    if (!Array.isArray(vibes) || !Array.isArray(whoWith) || !Array.isArray(preferences)) {
      return res.status(400).json({ 
        error: "vibes, whoWith, and preferences must be arrays" 
      });
    }

    // Validate budget
    const validBudgets = ["low", "medium", "high"];
    if (!validBudgets.includes(budget)) {
      return res.status(400).json({ 
        error: "budget must be one of: low, medium, high" 
      });
    }

    console.log(`🎯 Generating vacation location recommendations for ${startingLocation} (${numDays} days, ${budget} budget)`);

    // Generate vacation location recommendations
    const recommendationsData = await generateVacationLocationRecommendations({
      numDays,
      vibes,
      whoWith,
      startingLocation,
      preferences,
      budget
    });

    console.log(`✅ Vacation location recommendations generated for ${startingLocation}`);

    res.json(recommendationsData);

  } catch (error) {
    console.error("❌ Vacation location planner demo generation error:", error);
    res.status(500).json({ error: "Failed to generate vacation location recommendations" });
  }
});

/**
 * POST /tripwell/demo/vacation-planner/save
 * Save vacation planner demo data with user info (auth required)
 */
router.post("/vacation-planner/save", verifyFirebaseToken, async (req, res) => {
  try {
    const { 
      firebaseId, 
      email, 
      numDays, 
      vibes, 
      whoWith, 
      startingLocation, 
      preferences, 
      budget,
      recommendationsData 
    } = req.body;

    // Validate required fields
    if (!firebaseId || !email || !recommendationsData) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    console.log(`💾 Saving vacation planner demo for user ${email} (${startingLocation})`);

    // Create or find user with funnelStage = "vacation_planner_demo"
    let user = await TripWellUser.findOne({ firebaseId });
    
    if (!user) {
      user = new TripWellUser({
        firebaseId,
        email,
        funnelStage: "vacation_planner_demo",
        profileComplete: false
      });
    } else {
      // Update existing user's funnel stage
      user.funnelStage = "vacation_planner_demo";
    }

    await user.save();

    // Create a demo trip setup with vacation planner data
    const tripSetup = new TripBase({
      tripName: `Vacation Planning Demo - ${startingLocation}`,
      purpose: "Demo - Vacation Location Planning",
      city: startingLocation,
      startDate: new Date(),
      endDate: new Date(Date.now() + (numDays * 24 * 60 * 60 * 1000)), // numDays from now
      joinCode: `VACATION_${Date.now()}`,
      partyCount: whoWith.length > 0 ? whoWith.length : 1,
      whoWith: whoWith.length > 0 ? whoWith : ["solo"],
      isDemo: true,
      createdBy: firebaseId
    });

    await tripSetup.save();

    // Store the vacation planner data in the trip
    await TripBase.updateOne(
      { _id: tripSetup._id },
      { 
        $set: { 
          vacationPlannerData: {
            numDays,
            vibes,
            whoWith,
            startingLocation,
            preferences,
            budget,
            recommendations: recommendationsData.recommendations,
            summary: recommendationsData.summary
          }
        } 
      }
    );

    console.log(`✅ Vacation planner demo saved for user ${email}`);

    res.json({
      success: true,
      message: "Vacation planner demo saved successfully",
      tripSetup: tripSetup,
      funnelStage: "vacation_planner_demo"
    });

  } catch (error) {
    console.error("❌ Vacation planner demo save error:", error);
    res.status(500).json({ error: "Failed to save vacation planner demo" });
  }
});

module.exports = router;
