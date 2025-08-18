const mongoose = require("mongoose");
const TripBase = require("../models/TripWell/TripBase");
const TripIntent = require("../models/TripWell/TripIntent");

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/gofastbackend");

async function hydrateUserData() {
  try {
    console.log("🔧 Hydrating user data...");

    // Your existing trip data from localStorage
    const tripData = {
      tripName: "Paris",
      purpose: "Make memories",
      startDate: new Date("2025-08-16T00:00:00.000Z"),
      endDate: new Date("2025-08-22T00:00:00.000Z"),
      city: "Paris",
      partyCount: 1,
      whoWith: ["kids"],
      season: "Summer",
      daysTotal: 7,
      joinCode: "PARIS2025"
    };

    // Create TripBase record first
    const tripBase = new TripBase(tripData);
    await tripBase.save();
    console.log("✅ TripBase saved:", tripBase._id);

    // Now create TripIntent record using the TripBase _id
    const tripIntentData = {
      tripId: tripBase._id, // Use the actual MongoDB ObjectId from TripBase
      userId: "5m5XpT4J6Qf8B2tMUawHBKbvKbA2", // Your Firebase ID string
      priorities: ["culture", "food"],
      vibes: ["family-friendly", "educational"],
      mobility: ["walking", "metro"],
      travelPace: ["moderate"],
      budget: "mid-range"
    };

    const tripIntent = new TripIntent(tripIntentData);
    await tripIntent.save();
    console.log("✅ TripIntent saved:", tripIntent._id);

    console.log("🎉 User data hydrated successfully!");
    console.log("📝 TripBase ID:", tripBase._id.toString());
    console.log("📝 TripIntent ID:", tripIntent._id.toString());

  } catch (error) {
    console.error("❌ Error hydrating user data:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run the hydration
hydrateUserData();
