const express = require("express");
const router = express.Router();
const verifyFirebaseToken = require("../../middleware/verifyFirebaseToken");
const mongoose = require("mongoose");
const User = require("../../models/User");

// POST /tripwell/profile/setup
router.post("/profile/setup", verifyFirebaseToken, async (req, res) => {
  const firebaseId = req.user.uid;

  const {
    name,
    email,
    location,
    familySituation,
    travelStyle,
    tripVibe
  } = req.body;

  // Log the DB context (optional dev sanity check)
  console.log("📦 TripWell profile setup hitting DB:", mongoose.connection.name);

  try {
    const updatedUser = await User.findOneAndUpdate(
      { firebaseId },
      {
        userId: firebaseId, // ✅ Canonical: we mirror Firebase UID as internal userId
        email,
        name,
        location,
        profile: {
          familySituation,
          travelStyle,
          tripVibe
        }
      },
      {
        upsert: true,  // 🪄 MAGIC: creates if not found
        new: true      // returns the updated document
      }
    );

    res.status(200).json({ user: updatedUser });
  } catch (err) {
    console.error("🔥 TripWell profile setup error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
