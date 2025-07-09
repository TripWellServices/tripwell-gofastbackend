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

  console.log("📦 Profile setup hitting DB:", mongoose.connection.name);

  try {
    let user = await User.findOne({ firebaseId });

    if (!user) {
      // First-time user creation
      user = new User({
        firebaseId,
        email,
        name,
        location,
        profile: {
          familySituation,
          travelStyle,
          tripVibe
        }
      });

      await user.save(); // _id is created here

      // Now set userId = _id
      user.userId = user._id;
      await user.save();
    } else {
      // Update existing user
      user.email = email;
      user.name = name;
      user.location = location;
      user.profile = {
        familySituation,
        travelStyle,
        tripVibe
      };

      await user.save();
    }

    res.status(200).json({ user });
  } catch (err) {
    console.error("🔥 Profile setup error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;