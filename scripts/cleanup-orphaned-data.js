const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const TripWellUser = require('../models/TripWellUser');
const JoinCode = require('../models/TripWell/JoinCode');
const TripIntent = require('../models/TripWell/TripIntent');
const TripItinerary = require('../models/TripWell/TripItinerary');

async function cleanupOrphanedData() {
  try {
    console.log('🚀 Starting orphaned data cleanup...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all existing user IDs
    const existingUsers = await TripWellUser.find({}, '_id');
    const existingUserIds = existingUsers.map(user => user._id.toString());
    console.log(`📊 Found ${existingUserIds.length} existing users`);

    // 1. Clean up orphaned JoinCodes
    console.log('🧹 Cleaning up orphaned JoinCodes...');
    const orphanedJoinCodes = await JoinCode.find({
      userId: { $nin: existingUserIds }
    });
    
    if (orphanedJoinCodes.length > 0) {
      console.log(`🗑️ Found ${orphanedJoinCodes.length} orphaned JoinCodes:`);
      orphanedJoinCodes.forEach(code => {
        console.log(`   - ${code.joinCode} (userId: ${code.userId})`);
      });
      
      const deletedJoinCodes = await JoinCode.deleteMany({
        userId: { $nin: existingUserIds }
      });
      console.log(`✅ Deleted ${deletedJoinCodes.deletedCount} orphaned JoinCodes`);
    } else {
      console.log('✅ No orphaned JoinCodes found');
    }

    // 2. Clean up orphaned TripIntents
    console.log('🧹 Cleaning up orphaned TripIntents...');
    const orphanedTripIntents = await TripIntent.find({
      userId: { $nin: existingUserIds }
    });
    
    if (orphanedTripIntents.length > 0) {
      console.log(`🗑️ Found ${orphanedTripIntents.length} orphaned TripIntents`);
      const deletedTripIntents = await TripIntent.deleteMany({
        userId: { $nin: existingUserIds }
      });
      console.log(`✅ Deleted ${deletedTripIntents.deletedCount} orphaned TripIntents`);
    } else {
      console.log('✅ No orphaned TripIntents found');
    }

    // 3. Clean up orphaned TripItineraries
    console.log('🧹 Cleaning up orphaned TripItineraries...');
    const orphanedTripItineraries = await TripItinerary.find({
      userId: { $nin: existingUserIds }
    });
    
    if (orphanedTripItineraries.length > 0) {
      console.log(`🗑️ Found ${orphanedTripItineraries.length} orphaned TripItineraries`);
      const deletedTripItineraries = await TripItinerary.deleteMany({
        userId: { $nin: existingUserIds }
      });
      console.log(`✅ Deleted ${deletedTripItineraries.deletedCount} orphaned TripItineraries`);
    } else {
      console.log('✅ No orphaned TripItineraries found');
    }

    // 4. Summary
    console.log('\n🎉 Cleanup complete!');
    console.log('📊 Summary:');
    console.log(`   - Existing users: ${existingUserIds.length}`);
    console.log(`   - Orphaned JoinCodes cleaned: ${orphanedJoinCodes.length}`);
    console.log(`   - Orphaned TripIntents cleaned: ${orphanedTripIntents.length}`);
    console.log(`   - Orphaned TripItineraries cleaned: ${orphanedTripItineraries.length}`);

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the cleanup
cleanupOrphanedData();
