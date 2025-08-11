// routes/TripWell/tripSetupRoute.js
const express = require("express");
const router = express.Router();

const verifyFirebaseToken = require("../../middleware/verifyFirebaseToken");
const TripWellUser = require("../../models/TripWellUser");
const TripBase = require("../../models/TripWell/TripBase");
const { setUserTrip } = require("../../services/TripWell/userTripService");
const { parseTrip } = require("../../services/TripWell/tripSetupService");
const { pushTripToRegistry } = require("../../services/TripWell/joinCodePushService");

router.post("/", verifyFirebaseToken, async (req, res) => {
  try {
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ ok: false, error: "Unauthorized" });

    const { tripName, purpose, startDate, endDate, city, partyCount, whoWith = [], joinCode } = req.body || {};
    if (!tripName || !purpose || !city || !startDate || !endDate || !joinCode) {
      return res.status(400).json({ ok:false, error:"Missing required fields" });
    }

    const sd = new Date(startDate), ed = new Date(endDate);
    if (Number.isNaN(sd.getTime()) || Number.isNaN(ed.getTime())) {
      return res.status(400).json({ ok:false, error:"Invalid start/end date" });
    }

    const payload = {
      tripName: String(tripName).trim(),
      purpose:  String(purpose).trim(),
      city:     String(city).trim(),
      startDate: sd,
      endDate:   ed,
      joinCode:  String(joinCode).trim(),
      whoWith: Array.isArray(whoWith) ? whoWith : [],
    };
    if (partyCount !== undefined && partyCount !== "") {
      const pc = Number(partyCount);
      if (Number.isFinite(pc) && pc >= 1) payload.partyCount = pc;
    }

    // 1) SAVE THE TRIP FIRST - this is the main job
    const doc = await TripBase.create(payload);
    console.log("✅ Trip saved successfully:", doc._id.toString());

    // 2) ON SAVE SUCCESS - now do the patch work
    const user = await TripWellUser.findOne({ firebaseId: uid });
    if (!user) {
      console.warn("trip-setup: User not found for patch work, but trip was saved");
      return res.status(201).json({ ok: true, tripId: doc._id });
    }

    // 3a) Update trip base (parse/enrich with daysTotal, season, etc.)
    try {
      const patch = await parseTrip(doc);
      if (patch && typeof patch === "object" && Object.keys(patch).length) {
        await TripBase.updateOne({ _id: doc._id }, { $set: patch });
        console.log("✅ Updated trip base with patch:", Object.keys(patch));
      }
    } catch (e) {
      console.warn("trip-setup: parseTrip failed:", e.message);
      // Continue anyway - trip base update is not critical
    }

    // 3b) Update user (link user to trip)
    try {
      await setUserTrip(user._id, doc._id);
      console.log("✅ Updated user with trip link");
    } catch (e) {
      console.warn("trip-setup: setUserTrip failed:", e.message);
      // Continue anyway - user update is not critical
    }

    // 3c) Push to JoinCode registry
    try {
      await pushTripToRegistry(doc._id, user._id);
      console.log("✅ Pushed to JoinCode registry");
    } catch (e) {
      console.warn("trip-setup: join code registry push failed:", e.message);
      // Continue anyway - join code registry is not critical
    }

    // Return tripId for frontend navigation
    return res.status(201).json({ ok: true, tripId: doc._id });
  } catch (err) {
    console.error("❌ trip-setup error:", err);
    if (err.name === "ValidationError") {
      const msg = Object.values(err.errors || {}).map(e => e.message).join(", ");
      return res.status(400).json({ ok:false, error: msg || "Validation error" });
    }
    return res.status(500).json({ ok:false, error: err.message || "Server error" });
  }
});

module.exports = router;