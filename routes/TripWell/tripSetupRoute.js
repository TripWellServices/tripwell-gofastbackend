// routes/TripWell/tripSetupRoute.js
const express = require("express");
const router = express.Router();
const axios = require("axios");

const verifyFirebaseToken = require("../../middleware/verifyFirebaseToken");
const TripWellUser = require("../../models/TripWellUser");
const TripBase = require("../../models/TripWell/TripBase");
const { setUserTrip } = require("../../services/TripWell/userTripService");
const { parseTrip } = require("../../services/TripWell/tripSetupService");
const { pushTripToRegistry } = require("../../services/TripWell/joinCodePushService");
const { generateMetaAttractions } = require("../../services/TripWell/metaAttractionsService");

router.post("/", verifyFirebaseToken, async (req, res) => {
  try {
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ ok: false, error: "Unauthorized" });

    const { tripName, purpose, startDate, endDate, city, country, partyCount, whoWith = [], joinCode, demoMode = false } = req.body || {};
    
    // For demo mode, some fields can be null/optional
    if (demoMode) {
      if (!city) {
        return res.status(400).json({ ok:false, error:"Missing required field: city" });
      }
    } else {
      // Full mode requires all fields
      if (!tripName || !purpose || !city || !country || !startDate || !endDate || !joinCode) {
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

    // Simple payload - no more weight calculations!
    const payload = {
      city: String(city).trim(),
      country: String(country).trim(),
      whoWith: String(whoWith || "friends").trim(),
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

    // 1.5) CREATE OR GET CITY OBJECT - for meta attractions capability
    let cityDoc = null;
    let isNewCity = false;
    try {
      console.log("🔍 DEBUG: Checking for existing city:", city);
      // Check if city already exists
      const existingCity = await require("../../models/TripWell/City").findOne({ cityName: city });
      if (existingCity) {
        // Clean up old fields if they exist (migration)
        if (existingCity.country || existingCity.status) {
          console.log("🔧 DEBUG: Cleaning up old city fields");
          await require("../../models/TripWell/City").updateOne(
            { _id: existingCity._id },
            { $unset: { country: "", status: "" } }
          );
          console.log("✅ City cleaned up, removed old fields");
        }
        cityDoc = existingCity;
        isNewCity = false;
        console.log("✅ City already exists:", cityDoc.cityName, cityDoc._id);
      } else {
        console.log("🔍 DEBUG: Creating new city with:", { cityName: city });
        // Create new city
        cityDoc = new (require("../../models/TripWell/City"))({
          cityName: city
        });
        await cityDoc.save();
        isNewCity = true;
        console.log("✅ New city created:", cityDoc.cityName, cityDoc._id);
      }
    } catch (cityError) {
      console.error("❌ DEBUG: City creation failed:", cityError);
      console.warn("trip-setup: City creation failed:", cityError.message);
      // Continue anyway - city creation is not critical for trip creation
    }

    // 1.6) GENERATE META ATTRACTIONS FOR NEW CITIES (BACKGROUND)
    if (cityDoc && isNewCity) {
      console.log("🔍 DEBUG: Starting meta attractions generation for new city");
      console.log("🔍 DEBUG: CityId:", cityDoc._id, "CityName:", cityDoc.cityName);
      // Don't await - let this run in background
      generateMetaAttractions(cityDoc._id, cityDoc.cityName, "Summer")
        .then((result) => {
          console.log("✅ Meta attractions generated for new city:", cityDoc.cityName);
          console.log("🔍 DEBUG: Meta attractions result:", result);
        })
        .catch((metaError) => {
          console.error("❌ DEBUG: Meta attractions generation failed:", metaError);
          console.warn("trip-setup: Meta attractions generation failed:", metaError.message);
        });
      console.log("🔄 Meta attractions generation started in background for:", cityDoc.cityName);
    } else {
      console.log("🔍 DEBUG: Skipping meta attractions - cityDoc:", !!cityDoc, "isNewCity:", isNewCity);
    }

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

    // 3b) Update user (link user to trip and set journey stage)
    try {
      await setUserTrip(user._id, doc._id);
      console.log("✅ Updated user with trip link");
      
      // 🎯 NODE.JS MUTATES: Set journey stage when trip is created
      const userUpdateData = {
        journeyStage: 'trip_set_done',
        userStatus: 'active'
      };
      
      // Add cityId to TripBase if city object was created
      if (cityDoc) {
        await TripBase.updateOne({ _id: doc._id }, { $set: { cityId: cityDoc._id } });
        console.log("✅ Linking TripBase to city object:", cityDoc.cityName);
      }
      
      await TripWellUser.findByIdAndUpdate(user._id, {
        $set: userUpdateData
      });
      console.log("✅ Updated user journey stage to trip_set_done");
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

    // 🎯 TRIGGER: Call Python for trip creation analysis
    try {
      console.log(`🎯 Trip created - calling Python for user: ${user.email}`);
      const pythonResponse = await axios.post(`${process.env.TRIPWELL_AI_BRAIN}/useactionendpoint`, {
        user_id: user._id.toString(),
        firebase_id: user.firebaseId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileComplete: user.profileComplete,
        tripId: user.tripId,
        funnelStage: user.funnelStage,
        journeyStage: 'trip_set_done',  // ✅ Include journey stage
        userStatus: 'active',            // ✅ Include user state
        createdAt: user.createdAt,
        context: "trip_created",
        tripName: tripName,             // ✅ Include trip details
        city: city,                     // ✅ Include city
        startDate: computedTripData?.startDate || startDate,     // ✅ Include start date
        endDate: computedTripData?.endDate || endDate,           // ✅ Include end date
        partyCount: computedTripData?.partyCount || partyCount,  // ✅ Include party count
        whoWith: computedTripData?.whoWith || whoWith,           // ✅ Include who with
        season: computedTripData?.season,                        // ✅ Include season
        daysTotal: computedTripData?.daysTotal                   // ✅ Include days total
      }, {
        timeout: 15000
      });
      console.log("✅ Python trip creation analysis complete:", pythonResponse.data);
    } catch (err) {
      console.warn("⚠️ Python trip creation analysis failed (non-critical):", err.message);
      // Don't block trip creation if Python fails
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

    // Update user's funnel stage and journey state
    await TripWellUser.findOneAndUpdate(
      { firebaseId },
      { 
        funnelStage: "itinerary_demo",
        // 🎯 NODE.JS MUTATES: Set demo user state
        journeyStage: "trip_set_done",
        userStatus: "demo_only"
      },
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