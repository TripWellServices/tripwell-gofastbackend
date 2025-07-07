const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const TripBase = require("../../models/TripWell/TripBase");
const User = require("../../models/User");

// POST /tripwell/participantuser/create
router.post("/tripwell/participantuser/create", async (req, res) => {
  try {
    const { joinCode } = req.body;
    const authHeader = req.headers.authorization;

    if (!joinCode) {
      return res.status(400).json({ error: "Join code is required." });
    }

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid authorization token." });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const firebaseId = decodedToken.uid;
    const email = decodedToken.email || "";

    const trip = await TripBase.findOne({ joinCode: joinCode.trim().toLowerCase() });

    if (!trip) {
      return res.status(404).json({ error: "Trip not found for provided join code." });
    }

    let user = await User.findOne({ firebaseId });

    if (!user) {
      // Create a new participant user
      user = new User({
        firebaseId,
        userId: firebaseId,
        email,
        tripId: trip._id,
        role: "participant",
      });
      await user.save();
      console.log(`🆕 Created new participant user: ${firebaseId}`);
    } else {
      // Patch missing tripId or role if necessary
      let updated = false;

      if (!user.tripId) {
        user.tripId = trip._id;
        updated = true;
      }

      if (!user.role) {
        user.role = "participant";
        updated = true;
      }

      if (updated) {
        await user.save();
        console.log(`🔧 Updated existing user ${firebaseId} with tripId/role`);
      } else {
        console.log(`✅ Existing participant already set: ${firebaseId}`);
      }
    }

    return res.status(200).json({
      tripId: trip._id,
      tripName: trip.tripName,
      userId: user.userId,
    });

  } catch (err) {
    console.error("❌ Error in /tripwell/participantuser/create:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
