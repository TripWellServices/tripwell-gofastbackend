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
    // First get the current user to check their funnel stage
    const currentUser = await TripWellUser.findOne({ firebaseId });
    
    // Update profile and potentially exit funnel
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
          profileComplete: true,
          // If user was in funnel, upgrade them to full_app
          ...(currentUser?.funnelStage && currentUser.funnelStage !== 'full_app' && {
            funnelStage: 'full_app'
          })
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
