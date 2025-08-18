const mongoose = require("mongoose");
const TripIntent = require("../models/TripWell/TripIntent");
const TripBase = require("../models/TripWell/TripBase");

// Connect to MongoDB (adjust connection string as needed)
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/gofastbackend");

async function testAnchorData() {
  try {
    console.log("🔍 Testing TripIntent and TripBase data availability...\n");

    // Test 1: Check if we have any TripBase records
    const tripBases = await TripBase.find({}).limit(5);
    console.log(`📊 Found ${tripBases.length} TripBase records:`);
    tripBases.forEach((trip, index) => {
      console.log(`  ${index + 1}. Trip: ${trip.tripName} (ID: ${trip._id})`);
      console.log(`     City: ${trip.city}, Purpose: ${trip.purpose}`);
      console.log(`     Season: ${trip.season || 'not set'}, WhoWith: ${trip.whoWith?.join(', ') || 'not set'}`);
      console.log(`     UserId: ${trip.userId}`);
      console.log("");
    });

    // Test 2: Check if we have any TripIntent records
    const tripIntents = await TripIntent.find({}).limit(5);
    console.log(`📊 Found ${tripIntents.length} TripIntent records:`);
    tripIntents.forEach((intent, index) => {
      console.log(`  ${index + 1}. TripId: ${intent.tripId}, UserId: ${intent.userId}`);
      console.log(`     Priorities: ${intent.priorities?.join(', ') || 'none'}`);
      console.log(`     Vibes: ${intent.vibes?.join(', ') || 'none'}`);
      console.log(`     Mobility: ${intent.mobility?.join(', ') || 'none'}`);
      console.log(`     TravelPace: ${intent.travelPace?.join(', ') || 'none'}`);
      console.log(`     Budget: ${intent.budget || 'not set'}`);
      console.log("");
    });

    // Test 3: Try to find a specific trip with both TripBase and TripIntent
    if (tripBases.length > 0 && tripIntents.length > 0) {
      const testTripId = tripBases[0]._id;
      const testUserId = tripBases[0].userId;
      
      console.log(`🧪 Testing data lookup for TripId: ${testTripId}, UserId: ${testUserId}`);
      
      const [foundTripIntent, foundTripBase] = await Promise.all([
        TripIntent.findOne({ tripId: testTripId, userId: testUserId }),
        TripBase.findOne({ _id: testTripId, userId: testUserId })
      ]);

      if (foundTripIntent && foundTripBase) {
        console.log("✅ SUCCESS: Found both TripIntent and TripBase for test trip");
        console.log(`   TripBase: ${foundTripBase.tripName} in ${foundTripBase.city}`);
        console.log(`   TripIntent: ${foundTripIntent.priorities?.length || 0} priorities set`);
      } else {
        console.log("❌ FAILED: Could not find both TripIntent and TripBase for test trip");
        console.log(`   TripIntent found: ${!!foundTripIntent}`);
        console.log(`   TripBase found: ${!!foundTripBase}`);
      }
    }

    // Test 4: Check for any orphaned records
    const orphanedIntents = await TripIntent.aggregate([
      {
        $lookup: {
          from: "tripbases",
          localField: "tripId",
          foreignField: "_id",
          as: "tripBase"
        }
      },
      {
        $match: {
          tripBase: { $size: 0 }
        }
      }
    ]);

    if (orphanedIntents.length > 0) {
      console.log(`⚠️  WARNING: Found ${orphanedIntents.length} orphaned TripIntent records (no matching TripBase)`);
    } else {
      console.log("✅ No orphaned TripIntent records found");
    }

  } catch (error) {
    console.error("🔥 Error testing anchor data:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run the test
testAnchorData();
