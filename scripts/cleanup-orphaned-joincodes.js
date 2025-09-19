// scripts/cleanup-orphaned-joincodes.js
// Clean up orphaned join codes where JoinCode registry is empty but TripBase still has the code

const mongoose = require('mongoose');
require('dotenv').config();

const TripBase = require('../models/TripWell/TripBase');
const JoinCode = require('../models/TripWell/JoinCode');

async function cleanupOrphanedJoinCodes() {
  try {
    console.log('🔍 Finding orphaned join codes...');
    
    // Find all TripBase documents
    const allTrips = await TripBase.find({}, { joinCode: 1, tripName: 1, _id: 1 });
    console.log(`📊 Found ${allTrips.length} total trips`);
    
    const orphanedTrips = [];
    
    for (const trip of allTrips) {
      // Check if this joinCode exists in the JoinCode registry
      const registryEntry = await JoinCode.findOne({ joinCode: trip.joinCode });
      
      if (!registryEntry) {
        orphanedTrips.push({
          tripId: trip._id,
          tripName: trip.tripName,
          joinCode: trip.joinCode
        });
      }
    }
    
    console.log(`🚨 Found ${orphanedTrips.length} orphaned join codes:`);
    orphanedTrips.forEach(trip => {
      console.log(`   - ${trip.joinCode} (${trip.tripName})`);
    });
    
    if (orphanedTrips.length > 0) {
      console.log('\n🧹 Cleaning up orphaned join codes...');
      
      for (const trip of orphanedTrips) {
        // Clear the joinCode field from TripBase
        await TripBase.findByIdAndUpdate(trip.tripId, { 
          $unset: { joinCode: 1 } 
        });
        console.log(`✅ Cleared joinCode from trip: ${trip.tripName}`);
      }
      
      console.log(`\n🎉 Cleanup complete! Cleared ${orphanedTrips.length} orphaned join codes.`);
    } else {
      console.log('✅ No orphaned join codes found!');
    }
    
  } catch (error) {
    console.error('❌ Error cleaning up orphaned join codes:', error);
  }
}

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/GoFastFamily');
    console.log('🔗 Connected to MongoDB');
    
    await cleanupOrphanedJoinCodes();
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

if (require.main === module) {
  main();
}

module.exports = { cleanupOrphanedJoinCodes };
