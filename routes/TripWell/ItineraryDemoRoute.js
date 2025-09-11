// routes/TripWell/ItineraryDemoRoute.js
const express = require("express");
const router = express.Router();

const verifyFirebaseToken = require("../../middleware/verifyFirebaseToken");
const TripWellUser = require("../../models/TripWellUser");
const TripBase = require("../../models/TripWell/TripBase");
const { gptDemoBuildService } = require("../../services/TripWell/gptDemoBuildService");

// Step 1 & 2: Generate demo itinerary (no auth required)
router.post("/generate", async (req, res) => {
  try {
    const { destination, season, numDays, tripGoals } = req.body;

    // Validate required fields
    if (!destination || !season || !numDays) {
      return res.status(400).json({ 
        error: "Missing required fields: destination, season, numDays" 
      });
    }

    // Validate numDays
    if (numDays < 1 || numDays > 30) {
      return res.status(400).json({ 
        error: "numDays must be between 1 and 30" 
      });
    }

    console.log("🎯 Generating demo itinerary for:", { destination, season, numDays, tripGoals });

    // Call GPT Demo Build Service
    const result = await gptDemoBuildService(destination, season, numDays, tripGoals || []);

    console.log("✅ Demo itinerary generated successfully");

    res.json({ 
      success: true,
      itineraryDataDemo: result.itineraryDataDemo 
    });

  } catch (error) {
    console.error("❌ Error in demo itinerary generation:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to generate demo itinerary" 
    });
  }
});

// Step 3 & 4: Save demo trip after authentication
router.post("/save", async (req, res) => {
  try {
    const { itineraryDataDemo, firebaseId, email } = req.body;

    if (!itineraryDataDemo) {
      return res.status(400).json({ 
        success: false,
        error: "Missing itineraryDataDemo" 
      });
    }

    console.log("🎯 Saving demo trip for user:", firebaseId);

    // Find or create user with funnel stage
    let user = await TripWellUser.findOne({ firebaseId });
    
    if (!user) {
      // Create new user with funnel stage
      user = await TripWellUser.create({
        firebaseId,
        email: email || "",
        funnelStage: "itinerary_demo",
        // 🎯 NODE.JS MUTATES: Set demo user state
        journeyStage: "trip_set_done",
        userState: "demo_only"
      });
      console.log("✅ Created new user with funnelStage: itinerary_demo");
    } else {
      // Update existing user's funnel stage and state if needed
      if (user.funnelStage !== "itinerary_demo") {
        await TripWellUser.findOneAndUpdate(
          { firebaseId },
          { 
            funnelStage: "itinerary_demo",
            // 🎯 NODE.JS MUTATES: Set demo user state
            journeyStage: "trip_set_done",
            userState: "demo_only"
          },
          { new: true }
        );
        console.log("✅ Updated user funnelStage to: itinerary_demo");
      }
    }

    // Create demo trip using TripBase model
    const demoTripData = {
      city: itineraryDataDemo.destination,
      tripName: `Demo Trip to ${itineraryDataDemo.destination}`,
      purpose: 'Demo exploration',
      partyCount: 1,
      whoWith: ['solo'],
      joinCode: `DEMO_${Date.now()}`, // Generate unique demo join code
      startDate: new Date(), // Demo trips don't need real dates
      endDate: new Date(Date.now() + (itineraryDataDemo.numDays * 24 * 60 * 60 * 1000))
    };

    // Create the trip
    const tripDoc = await TripBase.create(demoTripData);
    console.log("✅ Demo trip saved successfully:", tripDoc._id.toString());

    // Store the demo itinerary data in the trip
    await TripBase.updateOne(
      { _id: tripDoc._id },
      { 
        $set: { 
          demoItineraryData: itineraryDataDemo,
          isDemo: true,
          createdBy: firebaseId
        } 
      }
    );

    // Link user to trip
    await TripWellUser.findOneAndUpdate(
      { firebaseId },
      { tripId: tripDoc._id },
      { new: true }
    );

    console.log("✅ Demo trip complete - user linked to trip");

    res.json({
      success: true,
      tripId: tripDoc._id,
      message: "Demo trip saved successfully",
      funnelStage: "itinerary_demo"
    });

  } catch (error) {
    console.error("❌ Error saving demo trip:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to save demo trip" 
    });
  }
});

module.exports = router;
