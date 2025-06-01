const TripBase = require("../../models/TripBase");
const { setUserTrip } = require("../../services/TripWell/userTripService");

async function createTrip(req, res) {
  try {
    const trip = await TripBase.create(req.body);

    // ✅ Link the new trip to the current user
    await setUserTrip(req.user.firebaseId, trip._id);

    res.status(201).json({ trip });
  } catch (err) {
    console.error("❌ Trip creation failed:", err);
    res.status(500).json({ error: "Trip creation failed" });
  }
}

module.exports = {
  createTrip,
};
