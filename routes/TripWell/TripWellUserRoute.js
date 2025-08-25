// tripwellUserRoute.js

const express = require("express");
const router = express.Router();
const TripWellUser = require("../../models/TripWellUser");

router.post("/createOrFind", async (req, res) => {
  try {
    const { firebaseId, email, funnelStage } = req.body;

    if (!firebaseId || !email) {
      return res.status(400).json({ error: "Missing firebaseId or email" });
    }

    let user = await TripWellUser.findOne({ firebaseId });

    if (!user) {
      user = new TripWellUser({
        firebaseId,
        email,
        name: null,           // Legacy placeholder
        firstName: null,      // ✅ Profile field
        lastName: null,       // ✅ Profile field
        hometownCity: null,   // ✅ Profile field
        state: null,          // ✅ Profile field
        travelStyle: [],      // ✅ Profile field
        tripVibe: [],         // ✅ Profile field
        tripId: null,
        role: "noroleset",    // Will be assigned later
        funnelStage: funnelStage || "none"  // Set funnel stage if provided
      });

      await user.save();
    } else if (funnelStage && user.funnelStage !== funnelStage) {
      // Update funnel stage if user is progressing
      user.funnelStage = funnelStage;
      await user.save();
    }

    return res.status(200).json(user);
  } catch (err) {
    console.error("❌ Error in createOrFind:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
