const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Import models
const TripWellUser = require('../../models/TripWellUser');
const JoinCode = require('../../models/TripWell/JoinCode');
const TripIntent = require('../../models/TripWell/TripIntent');
const TripDay = require('../../models/TripWell/TripDay');

// Admin cleanup endpoint
router.post('/cleanup-orphaned-data', async (req, res) => {
  try {
    console.log('🚀 Starting orphaned data cleanup via admin endpoint...');
    
    // Get all existing user IDs
    const existingUsers = await TripWellUser.find({}, '_id');
    const existingUserIds = existingUsers.map(user => user._id.toString());
    console.log(`📊 Found ${existingUserIds.length} existing users`);

    // Find orphaned JoinCodes
    const orphanedJoinCodes = await JoinCode.find({
      userId: { $nin: existingUserIds }
    });
    console.log(`🔍 Found ${orphanedJoinCodes.length} orphaned join codes`);

    // Find orphaned TripIntents
    const orphanedTripIntents = await TripIntent.find({
      userId: { $nin: existingUserIds }
    });
    console.log(`🔍 Found ${orphanedTripIntents.length} orphaned trip intents`);

    // Find orphaned TripDays
    const orphanedTripDays = await TripDay.find({
      tripId: { $nin: existingUserIds }
    });
    console.log(`🔍 Found ${orphanedTripDays.length} orphaned trip days`);

    // Delete orphaned data
    let deletedCount = 0;
    
    if (orphanedJoinCodes.length > 0) {
      const joinCodeResult = await JoinCode.deleteMany({
        userId: { $nin: existingUserIds }
      });
      deletedCount += joinCodeResult.deletedCount;
      console.log(`🗑️ Deleted ${joinCodeResult.deletedCount} orphaned join codes`);
    }

    if (orphanedTripIntents.length > 0) {
      const tripIntentResult = await TripIntent.deleteMany({
        userId: { $nin: existingUserIds }
      });
      deletedCount += tripIntentResult.deletedCount;
      console.log(`🗑️ Deleted ${tripIntentResult.deletedCount} orphaned trip intents`);
    }

    if (orphanedTripDays.length > 0) {
      const tripDayResult = await TripDay.deleteMany({
        tripId: { $nin: existingUserIds }
      });
      deletedCount += tripDayResult.deletedCount;
      console.log(`🗑️ Deleted ${tripDayResult.deletedCount} orphaned trip days`);
    }

    console.log(`✅ Cleanup complete! Deleted ${deletedCount} orphaned records`);

    res.json({
      success: true,
      message: `Successfully cleaned up ${deletedCount} orphaned records`,
      details: {
        orphanedJoinCodes: orphanedJoinCodes.length,
        orphanedTripIntents: orphanedTripIntents.length,
        orphanedTripDays: orphanedTripDays.length,
        totalDeleted: deletedCount
      }
    });

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
