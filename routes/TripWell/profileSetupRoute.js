const express = require("express");
const router = express.Router();
const TripWellUser = require("../../models/TripWellUser");
const verifyFirebaseToken = require("../../middleware/verifyFirebaseToken");

// Update user profile (after Access step)
router.put("/profile", verifyFirebaseToken, async (req, res) => {
  const firebaseId = req.user.uid; // from Firebase token

  const {
    firstName,
    lastName,
    hometownCity,
    state,
    travelStyle,
    tripVibe
  } = req.body;

  try {
    const user = await TripWellUser.findOneAndUpdate(
      { firebaseId },
      {
        $set: {
          firstName,
          lastName,
          hometownCity,
          state,
          travelStyle,
          tripVibe,
          profileComplete: true
        }
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error("🔥 Error updating profile:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
