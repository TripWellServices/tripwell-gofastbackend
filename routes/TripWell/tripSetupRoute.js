// routes/TripWell/tripSetupRoute.js
const express = require("express");
const router = express.Router();

const verifyFirebaseToken = require("../../middleware/verifyFirebaseToken");
const TripWellUser = require("../../models/TripWellUser");
const TripBase = require("../../models/TripWell/TripBase");
const { setUserTrip } = require("../../services/TripWell/userTripService");
const { parseTrip } = require("../../services/TripWell/tripSetupService");
const { pushTripToRegistry } = require("../../services/TripWell/joinCodePushService");

router.post("/", verifyFirebaseToken, async (req, res) => {
  try {
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ ok: false, error: "Unauthorized" });

    const { tripName, purpose, startDate, endDate, city, partyCount, whoWith = [], joinCode, demoMode = false } = req.body || {};
    
    // For demo mode, some fields can be null/optional
    if (demoMode) {
      if (!city) {
        return res.status(400).json({ ok:false, error:"Missing required field: city" });
      }
    } else {
      // Full mode requires all fields
      if (!tripName || !purpose || !city || !startDate || !endDate || !joinCode) {
        return res.status(400).json({ ok:false, error:"Missing required fields" });
      }
    }

    // Only validate dates if they're provided (demo mode might not have dates)
    let sd, ed;
    if (startDate && endDate) {
      sd = new Date(startDate);
      ed = new Date(endDate);
      if (Number.isNaN(sd.getTime()) || Number.isNaN(ed.getTime())) {
        return res.status(400).json({ ok:false, error:"Invalid start/end date" });
      }
    }

    const payload = {
      city: String(city).trim(),
      whoWith: Array.isArray(whoWith) ? whoWith : [],
    };
    
    // Add optional fields for demo mode
    if (tripName) payload.tripName = String(tripName).trim();
    if (purpose) payload.purpose = String(purpose).trim();
    if (startDate && endDate) {
      payload.startDate = sd;
      payload.endDate = ed;
    }
    if (joinCode) payload.joinCode = String(joinCode).trim();
    if (partyCount !== undefined && partyCount !== "") {
      const pc = Number(partyCount);
      if (Number.isFinite(pc) && pc >= 1) payload.partyCount = pc;
    }

    // 1) SAVE THE TRIP FIRST - this is the main job
    const doc = await TripBase.create(payload);
    console.log("✅ Trip saved successfully:", doc._id.toString());

    // 2) ON SAVE SUCCESS - now do the patch work
    const user = await TripWellUser.findOne({ firebaseId: uid });
    if (!user) {
      console.warn("trip-setup: User not found for patch work, but trip was saved");
      return res.status(201).json({ ok: true, tripId: doc._id });
    }

    // 3a) Update trip base (parse/enrich with daysTotal, season, etc.)
    let computedTripData = null;
    try {
      const patch = await parseTrip(doc);
      if (patch && typeof patch === "object" && Object.keys(patch).length) {
        await TripBase.updateOne({ _id: doc._id }, { $set: patch });
        console.log("✅ Updated trip base with patch:", Object.keys(patch));
        
        // Store computed data for frontend
        computedTripData = {
          tripId: doc._id,
          tripName: patch.tripName || doc.tripName,
          purpose: patch.purpose || doc.purpose,
          startDate: patch.startDate || doc.startDate,
          endDate: patch.endDate || doc.endDate,
          city: patch.city || doc.city,
          joinCode: patch.joinCode || doc.joinCode,
          whoWith: patch.whoWith || doc.whoWith || [],
          partyCount: patch.partyCount || doc.partyCount,
          season: patch.season,
          daysTotal: patch.daysTotal,
          dateRange: patch.dateRange
        };
      }
    } catch (e) {
      console.warn("trip-setup: parseTrip failed:", e.message);
      // Continue anyway - trip base update is not critical
    }

    // 3b) Update user (link user to trip)
    try {
      await setUserTrip(user._id, doc._id);
      console.log("✅ Updated user with trip link");
    } catch (e) {
      console.warn("trip-setup: setUserTrip failed:", e.message);
      // Continue anyway - user update is not critical
    }

    // 3c) Push to JoinCode registry
    try {
      await pushTripToRegistry(doc._id, user._id);
      console.log("✅ Pushed to JoinCode registry");
    } catch (e) {
      console.warn("trip-setup: join code registry push failed:", e.message);
      // Continue anyway - join code registry is not critical
    }

    // Return tripId and computed trip data for frontend
    return res.status(201).json({ 
      ok: true, 
      tripId: doc._id,
      tripData: computedTripData // Include computed data (daysTotal, season, etc.)
    });
  } catch (err) {
    console.error("❌ trip-setup error:", err);
    if (err.name === "ValidationError") {
      const msg = Object.values(err.errors || {}).map(e => e.message).join(", ");
      return res.status(400).json({ ok:false, error: msg || "Validation error" });
    }
    return res.status(500).json({ ok:false, error: err.message || "Server error" });
  }
});

// Demo route for generating itinerary without auth
router.post("/demo", async (req, res) => {
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

    // Call GPT Demo Build Service
    const { gptDemoBuildService } = require("../../services/TripWell/gptDemoBuildService");
    const result = await gptDemoBuildService(destination, season, numDays, tripGoals || []);

    res.json({ itineraryDataDemo: result.itineraryDataDemo });

  } catch (error) {
    console.error("❌ Error in demo itinerary generation:", error);
    res.status(500).json({ error: "Failed to generate demo itinerary" });
  }
});

// Save demo itinerary after authentication
router.post("/demo/save", verifyFirebaseToken, async (req, res) => {
  try {
    const { itineraryDataDemo } = req.body;
    const firebaseId = req.user.uid;

    if (!itineraryDataDemo) {
      return res.status(400).json({ 
        error: "Missing itineraryDataDemo" 
      });
    }

    // Find the user
    const user = await TripWellUser.findOne({ firebaseId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Create a demo trip using the universal tripSetupRoute approach
    const demoTripData = {
      city: itineraryDataDemo.destination,
      demoMode: true,
      tripName: `Demo Trip to ${itineraryDataDemo.destination}`,
      purpose: 'Demo exploration',
      partyCount: 1,
      whoWith: ['solo']
    };

    // Create the trip
    const doc = await TripBase.create(demoTripData);
    console.log("✅ Demo trip saved successfully:", doc._id.toString());

    // Update user's funnel stage
    await TripWellUser.findOneAndUpdate(
      { firebaseId },
      { funnelStage: "itinerary_demo" },
      { new: true }
    );

    // Store the demo itinerary data in the trip (we can add a field for this)
    await TripBase.updateOne(
      { _id: doc._id },
      { 
        $set: { 
          demoItineraryData: itineraryDataDemo,
          isDemo: true
        } 
      }
    );

    res.json({
      success: true,
      tripId: doc._id,
      message: "Demo trip saved successfully"
    });

  } catch (error) {
    console.error("❌ Error saving demo trip:", error);
    res.status(500).json({ error: "Failed to save demo trip" });
  }
});

module.exports = router;