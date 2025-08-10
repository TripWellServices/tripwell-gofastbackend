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

// POST /tripwell/tripbase (Pattern A: mounted at /tripwell/tripbase, route is /)
router.post("/", verifyFirebaseToken, async (req, res) => {
  try {
    console.log("📝 tripbase body:", req.body);
    const firebaseId = req.user?.uid;
    if (!firebaseId) return res.status(401).json({ ok: false, error: "Unauthorized" });

    const {
      tripName, purpose, startDate, endDate, city, joinCode,
      whoWith = [], partyCount
    } = req.body;

    if (!tripName || !city || !startDate || !endDate) {
      return res.status(400).json({ ok: false, error: "Missing required fields" });
    }

    // Verify the user exists
    const user = await TripWellUser.findOne({ firebaseId });
    if (!user) return res.status(404).json({ ok: false, error: "User not found" });

    const payload = {
      tripName,
      purpose,
      city,
      joinCode,
      whoWith: Array.isArray(whoWith) ? whoWith : [],
      partyCount: (partyCount ?? null),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    };

    const doc = await TripBase.create(payload);
    
    // Update user with tripId and role
    await setUserTrip(user._id, doc._id);
    
    return res.status(201).json({ ok: true, tripId: doc._id });
  } catch (err) {
    console.error("❌ tripbase error:", err);
    if (err.code === 11000 && err.keyPattern?.joinCode) {
      return res.status(409).json({ ok: false, error: "Join code already taken" });
    }
    if (err.name === "ValidationError") {
      return res.status(400).json({ ok: false, error: Object.values(err.errors).map(e=>e.message).join(", ") });
    }
    return res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
