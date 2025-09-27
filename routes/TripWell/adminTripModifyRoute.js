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

// DELETE /tripwell/admin/trips/:id - Delete a trip with cascade deletion
router.delete("/trips/:id", async (req, res) => {
  try {
    const tripId = req.params.id;
    console.log(`🗑️ Admin attempting to delete trip: ${tripId}`);
    
    // Find the trip first to get its name for logging
    const tripToDelete = await TripBase.findById(tripId);
    if (!tripToDelete) {
      console.log(`❌ Trip not found: ${tripId}`);
      return res.status(404).json({ error: "Trip not found" });
    }
    
    // Import cascade deletion service
    const { deleteTripCascade } = require("../../services/TripWell/modularCascadeService");
    
    // Start a session for transaction
    const mongoose = require("mongoose");
    const session = await mongoose.startSession();
    
    try {
      await session.withTransaction(async () => {
        console.log(`🔍 DEBUG: Starting cascade deletion for trip ${tripId}`);
        // Delete trip and all associated data (cascade deletion)
        const deletionResult = await deleteTripCascade(tripId, session);
        console.log(`🗑️ Cascade deleted trip ${tripToDelete.tripName} and ${deletionResult.totalDeleted} total records`);
        console.log(`🔍 DEBUG: Deletion result:`, deletionResult);
      });
      
      console.log(`✅ Admin deleted trip: ${tripToDelete.tripName} (${tripId}) with cascade deletion`);
      res.json({ 
        message: "Trip deleted successfully with cascade deletion",
        tripName: tripToDelete.tripName,
        totalRecordsDeleted: deletionResult.totalDeleted
      });
      
    } finally {
      await session.endSession();
    }
    
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
