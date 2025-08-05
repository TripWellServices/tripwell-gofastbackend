const express = require("express");
const router = express.Router();
const verifyFirebaseToken = require("../../middleware/verifyFirebaseToken");
const User = require("../../models/User");
const TripBase = require("../../models/TripWell/TripBase");
const TripIntent = require("../../models/TripWell/TripIntent");
const AnchorLogic = require("../../models/TripWell/AnchorLogic");
const TripDay = require("../../models/TripWell/TripDay");

router.get("/tripstatus", verifyFirebaseToken, async (req, res) => {
  try {
    const firebaseId = req.user.uid;
    const user = await User.findOne({ firebaseId });

    if (!user) return res.status(404).json({ error: "User not found" });

    let tripId = null;
    let tripStarted = false;
    let tripComplete = false;

    let trip = null;
    if (user.tripId) {
      trip = await TripBase.findById(user.tripId);
      if (trip) {
        tripId = trip._id;
        tripStarted = !!trip.tripStarted;
        tripComplete = !!trip.tripComplete;
      }
    }

    const status = {
      userId: user._id,
      tripId,
      tripExists: !!trip,
      intentExists: false,
      anchorsExist: false,
      daysExist: false,
      tripStarted,
      tripComplete
    };

    if (!trip) return res.json({ tripStatus: status });

    const [intent, anchors, days] = await Promise.all([
      TripIntent.findOne({ tripId }),
      AnchorLogic.findOne({ tripId }),
      TripDay.findOne({ tripId })
    ]);

    if (intent) status.intentExists = true;
    if (anchors) status.anchorsExist = true;
    if (days) status.daysExist = true;

    res.json({ tripStatus: status });

  } catch (err) {
    console.error("❌ tripstatus error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
