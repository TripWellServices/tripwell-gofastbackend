// routes/TripWell/tripbaseRoutes.js
const express = require("express");
const router = express.Router();

const verifyFirebaseToken = require("../../middleware/verifyFirebaseToken");
const TripWellUser = require("../../models/TripWellUser");
const TripBase = require("../../models/TripWell/TripBase");
const { setUserTrip } = require("../../services/TripWell/userTripService");
const { parseTrip } = require("../../services/TripWell/tripSetupService");

// Test route to verify mounting
router.get("/test", (req, res) => {
  res.json({ message: "tripbaseRoutes is working!" });
});

// POST /tripwell/tripbase  (mounted in index.js)
router.post("/tripbase", verifyFirebaseToken, async (req, res) => {
  try {
    console.log("➡️  POST /tripwell/tripbase");
    console.log("📥 body:", req.body);

    const firebaseId = req.user?.uid;
    if (!firebaseId) return res.status(401).json({ error: "Unauthorized" });

    const {
      tripName, purpose, startDate, endDate,
      joinCode, whoWith, partyCount, city
    } = req.body;

    // Required fields — purpose added
    const missing = [];
    if (!tripName) missing.push("tripName");
    if (!purpose) missing.push("purpose");
    if (!startDate) missing.push("startDate");
    if (!endDate) missing.push("endDate");
    if (!city) missing.push("city");
    if (missing.length) {
      return res.status(400).json({ error: `Missing required fields: ${missing.join(", ")}` });
    }

    // Date sanity
    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ error: "startDate must be on/before endDate" });
    }

    // Ensure whoWith is an array
    if (!Array.isArray(whoWith)) {
      return res.status(400).json({ error: "whoWith must be an array" });
    }

    // Verify the user exists and matches the Firebase token
    const user = await TripWellUser.findOne({ firebaseId });
    if (!user) return res.status(404).json({ error: "User not found" });

    let trip = new TripBase({
      tripName, purpose, startDate, endDate,
      joinCode, whoWith, partyCount, city
    });

    try {
      console.log("💾 Saving trip to database...");
      await trip.save();
      console.log("✅ Trip saved successfully");
    } catch (err) {
      console.error("❌ Trip save failed:", err);
      if (err.code === 11000 && err.keyPattern?.joinCode) {
        return res.status(409).json({ error: "Join code already taken" });
      }
      throw err;
    }

    console.log("🔄 Parsing trip...");
    try {
      trip = parseTrip(trip);
      console.log("✅ Trip parsed successfully");
    } catch (err) {
      console.error("❌ Trip parsing failed:", err);
      throw err;
    }
    
    console.log("🔄 Setting user trip...");
    console.log("   User ID:", String(user._id));
    console.log("   Trip ID:", String(trip._id));
    try {
      await setUserTrip(user._id, trip._id);
      console.log("✅ User trip set successfully");
    } catch (err) {
      console.error("❌ User trip set failed:", err);
      throw err;
    }
    
    console.log("✅ Trip created successfully!");
    console.log("   Trip ID:", String(trip._id));
    console.log("   User updated with tripId and role");
    
    return res.status(201).json({ tripId: trip._id });
  } catch (err) {
    console.error("❌ Trip creation failed:", err);
    return res.status(500).json({ error: "Trip creation failed" });
  }
});

module.exports = router;
