// routes/TripWell/tripPatchRoutes.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const verifyFirebaseToken = require("../../middleware/verifyFirebaseToken");
const TripWellUser = require("../../models/TripWellUser");
const TripBase = require("../../models/TripWell/TripBase"); // only used if parseTrip returns a patch
const { setUserTrip } = require("../../services/TripWell/userTripService");
const { parseTrip } = require("../../services/TripWell/tripSetupService");

// POST /tripwell/trip-patch
// Body: { tripId: string }
// Auth: Firebase (required)
router.post("/", verifyFirebaseToken, async (req, res) => {
  try {
    const uid = req.user?.uid;
    if (!uid) return res.sendStatus(401);

    const { tripId } = req.body || {};
    if (!tripId || !mongoose.Types.ObjectId.isValid(tripId)) return res.sendStatus(400);

    const user = await TripWellUser.findOne({ firebaseId: uid });
    if (!user) return res.sendStatus(404);

    // 1) Link user -> trip (current trip)
    await setUserTrip(user._id, tripId);

    // 2) Parse/enrich trip (daysTotal, season, etc.)
    try {
      const patch = await parseTrip(tripId); // supports either style:
      // - returns an object of fields to $set
      // - or performs its own persistence and returns nothing
      if (patch && typeof patch === "object" && Object.keys(patch).length) {
        await TripBase.updateOne({ _id: tripId }, { $set: patch });
      }
    } catch (e) {
      console.warn("trip-patch: parseTrip failed:", e.message);
      // swallow parse errors; patch route should not block user flow
    }

    // success, nothing to report to FE
    return res.sendStatus(204);
  } catch (err) {
    console.error("trip-patch error:", err);
    return res.sendStatus(500);
  }
});

module.exports = router;