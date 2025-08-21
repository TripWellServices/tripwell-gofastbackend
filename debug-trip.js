const mongoose = require("mongoose");
const TripBase = require("./models/TripWell/TripBase");
const TripDay = require("./models/TripWell/TripDay");
const TripIntent = require("./models/TripWell/TripIntent");
const AnchorLogic = require("./models/TripWell/AnchorLogic");

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/tripwell");

async function debugTrip() {
  try {
    console.log("🔍 DEBUGGING TRIP DATA");
    console.log("=" .repeat(50));

    // 1. Find all trips (limit to recent ones)
    console.log("\n📋 RECENT TRIPS:");
    const recentTrips = await TripBase.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('_id tripName city daysTotal createdAt');
    
    recentTrips.forEach((trip, index) => {
      console.log(`${index + 1}. ${trip.tripName} (${trip.city}) - ${trip.daysTotal} days`);
      console.log(`   ID: ${trip._id}`);
      console.log(`   Created: ${trip.createdAt}`);
      console.log("");
    });

    // 2. If you have a specific tripId, use it here
    const specificTripId = process.argv[2]; // Pass as command line arg
    
    if (specificTripId) {
      console.log(`\n🎯 DETAILED ANALYSIS FOR TRIP: ${specificTripId}`);
      console.log("=" .repeat(50));

      // Get trip base data
      const trip = await TripBase.findById(specificTripId);
      if (!trip) {
        console.log("❌ Trip not found!");
        return;
      }

      console.log(`\n📍 TRIP BASE:`);
      console.log(`   Name: ${trip.tripName}`);
      console.log(`   City: ${trip.city}`);
      console.log(`   Days: ${trip.daysTotal}`);
      console.log(`   Created: ${trip.createdAt}`);

      // Get trip intent
      const intent = await TripIntent.findOne({ tripId: specificTripId });
      console.log(`\n🎯 TRIP INTENT:`);
      console.log(`   Found: ${!!intent}`);
      if (intent) {
        console.log(`   Purpose: ${intent.purpose}`);
        console.log(`   Who: ${intent.whoWith?.join(", ")}`);
      }

      // Get anchors
      const anchors = await AnchorLogic.find({ tripId: specificTripId });
      console.log(`\n⚓ ANCHORS:`);
      console.log(`   Count: ${anchors.length}`);
      if (anchors.length > 0) {
        anchors.forEach((anchor, index) => {
          console.log(`   ${index + 1}. ${anchor.enrichedAnchors?.length || 0} enriched anchors`);
        });
      }

      // Get trip days
      const tripDays = await TripDay.find({ tripId: specificTripId }).sort({ dayIndex: 1 });
      console.log(`\n📅 TRIP DAYS:`);
      console.log(`   Total days found: ${tripDays.length}`);
      
      tripDays.forEach((day) => {
        console.log(`\n   Day ${day.dayIndex}:`);
        console.log(`     Summary: ${day.summary?.substring(0, 100)}...`);
        console.log(`     Blocks: ${Object.keys(day.blocks || {}).length}`);
        console.log(`     Complete: ${day.isComplete}`);
        console.log(`     Modified: ${day.modifiedByUser}`);
        
        // Show block details
        Object.entries(day.blocks || {}).forEach(([timeOfDay, block]) => {
          if (block && block.title) {
            console.log(`       ${timeOfDay}: ${block.title}`);
          }
        });
      });

    } else {
      console.log("\n💡 To debug a specific trip, run:");
      console.log("   node debug-trip.js <tripId>");
      console.log("\nExample:");
      console.log("   node debug-trip.js 689e2673e2ffab02f858cee6");
    }

  } catch (error) {
    console.error("❌ Debug error:", error);
  } finally {
    mongoose.disconnect();
  }
}

debugTrip();
