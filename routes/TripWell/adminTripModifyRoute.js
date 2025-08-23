const express = require("express");
const router = express.Router();
const TripBase = require("../../models/TripWell/TripBase");

// GET /tripwell/admin/trips - Fetch all trips for admin dashboard
router.get("/trips", async (req, res) => {
  try {
    const trips = await TripBase.find({}).sort({ createdAt: -1 });
    
    // Transform data for admin dashboard
    const adminTrips = trips.map(trip => ({
      tripId: trip._id,
      tripName: trip.tripName,
      joinCode: trip.joinCode,
      city: trip.city,
      startDate: trip.startDate,
      endDate: trip.endDate,
      daysTotal: trip.daysTotal,
      season: trip.season,
      partyCount: trip.partyCount,
      createdAt: trip.createdAt,
      updatedAt: trip.updatedAt
    }));
    
    res.json(adminTrips);
  } catch (error) {
    console.error("❌ Admin trips fetch error:", error);
    res.status(500).json({ error: "Failed to fetch trips" });
  }
});

// DELETE /tripwell/admin/trips/:id - Delete a trip
router.delete("/trips/:id", async (req, res) => {
  try {
    const tripId = req.params.id;
    
    // Find and delete the trip
    const deletedTrip = await TripBase.findByIdAndDelete(tripId);
    
    if (!deletedTrip) {
      return res.status(404).json({ error: "Trip not found" });
    }
    
    console.log(`✅ Admin deleted trip: ${deletedTrip.tripName} (${tripId})`);
    res.json({ message: "Trip deleted successfully" });
  } catch (error) {
    console.error("❌ Admin trip delete error:", error);
    res.status(500).json({ error: "Failed to delete trip" });
  }
});

// GET /tripwell/admin/trips/:id - Get specific trip details
router.get("/trips/:id", async (req, res) => {
  try {
    const tripId = req.params.id;
    
    const trip = await TripBase.findById(tripId);
    
    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }
    
    res.json(trip);
  } catch (error) {
    console.error("❌ Admin trip fetch error:", error);
    res.status(500).json({ error: "Failed to fetch trip" });
  }
});

module.exports = router;
