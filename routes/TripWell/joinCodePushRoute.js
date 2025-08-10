// routes/TripWell/joinCodePushRoute.js

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const verifyFirebaseToken = require("../../middleware/verifyFirebaseToken");
const TripWellUser = require("../../models/TripWellUser");
const { pushTripToRegistry } = require("../../services/TripWell/joinCodePushService");

// POST /tripwell/joincode-push
// Body: { tripId: string }
// Auth: Firebase (required)
// Purpose: Push tripId, userId, joinCode to JoinCode registry
router.post("/", verifyFirebaseToken, async (req, res) => {
  try {
    const uid = req.user?.uid;
    if (!uid) {
      return res.status(401).json({ ok: false, error: "Unauthorized" });
    }

    const { tripId } = req.body || {};
    if (!tripId || !mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({ ok: false, error: "Invalid tripId" });
    }

    // Get user
    const user = await TripWellUser.findOne({ firebaseId: uid });
    if (!user) {
      return res.status(404).json({ ok: false, error: "User not found" });
    }

    // Push to JoinCode registry
    const registryEntry = await pushTripToRegistry(tripId, user._id);

    return res.status(200).json({ 
      ok: true, 
      message: "Successfully pushed to JoinCode registry",
      registryEntry: {
        joinCode: registryEntry.joinCode,
        tripId: registryEntry.tripId,
        userId: registryEntry.userId
      }
    });

  } catch (err) {
    console.error("❌ joinCode-push error:", err);
    
    if (err.message.includes("already exists")) {
      return res.status(409).json({ ok: false, error: err.message });
    }
    
    if (err.message.includes("not found")) {
      return res.status(404).json({ ok: false, error: err.message });
    }

    return res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

module.exports = router;
