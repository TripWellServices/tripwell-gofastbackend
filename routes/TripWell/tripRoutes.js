const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const TripBase = require("../../models/TripWell/TripBase");
const { parseTrip } = require("../../services/TripWell/tripParser");

// === LOCAL TRIPBASE ROUTES ===

// ✅ Create New Trip
router.post("/tripbase", async (req, res) => {
  try {
    const trip = await TripBase.create(req.body);

    // 🔥 Parse immediately
    const parsed = parseTrip(trip);
    trip.destination = parsed.destination;
    trip.dateRange = parsed.dateRange;
    trip.daysTotal = parsed.daysTotal;
    trip.season = parsed.season;

    await trip.save();

    res.status(201).json(trip);
  } catch (err) {
    console.error("❌ Trip creation failed:", err);
    res.status(500).json({ error: "Trip creation failed" });
  }
});

// ✅ Get Trip by ID
router.get("/tripbase/:id", async (req, res) => {
  try {
    const trip = await TripBase.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }
    res.json(trip);
  } catch (err) {
    console.error("❌ Trip fetch failed:", err);
    res.status(500).json({ error: "Trip fetch failed" });
  }
});

// === SUB-ROUTES ===
const tripChat = require("./tripChat");
const userTripUpdate = require("./userTripUpdate");
const profileSetup = require("./profileSetup");

router.use("/trip", tripChat);          // /trip/:tripId/chat
router.use("/trip", userTripUpdate);    // /trip/:tripId/update
router.use("/trip", profileSetup);      // /trip/setup

module.exports = router;
