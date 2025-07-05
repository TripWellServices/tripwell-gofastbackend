const express = require("express");
const router = express.Router();
const verifyFirebaseToken = require("../../middleware/verifyFirebaseToken");
const mongoose = require("mongoose");
const User = require("../../models/User");

// POST /api/users/profile/setup
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

  // ✅ Confirm DB connection name before saving
  console.log("📦 Profile setup hitting DB:", mongoose.connection.name);

  try {
    const updatedUser = await User.findOneAndUpdate(
      { firebaseId },
      {
        firebaseId,
        userId: firebaseId,
        email,
        name,
        location,
        profile: {
          familySituation,
          travelStyle,
          tripVibe
        }
      },
      { upsert: true, new: true }
    );

    res.status(200).json({ user: updatedUser });
  } catch (err) {
    console.error("🔥 Profile setup error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
