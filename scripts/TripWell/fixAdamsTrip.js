const mongoose = require("mongoose");
const TripBase = require("../../models/TripWell/TripBase");
const TripIntent = require("../../models/TripWell/TripIntent");
const { parseTrip } = require("../../services/TripWell/tripSetupService");

require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI;

async function run() {
  console.log("🌐 Connecting to Mongo:", MONGO_URI);
  await mongoose.connect(MONGO_URI);
  console.log("✅ Mongo connected:", mongoose.connection.name);

  const tripId = "683facd5a84346dd938bf345"; // 👈 Real ObjectId
  const userId = "5m5XpT4J6Qf8B2tMUawHBKbvKbA2"; // 👈 Real Firebase UID

  // 1. Fix TripBase
  const trip = await TripBase.findById(tripId);
  if (!trip) {
    console.error("❌ Trip not found.");
    return;
  }

  // Inject userId if missing
  if (!trip.userId) trip.userId = userId;

  const parsed = parseTrip(trip);

  // Now assign safe values back
  trip.city = parsed.city;
  trip.destination = parsed.destination;
  trip.daysTotal = parsed.daysTotal;
  trip.dateRange = parsed.dateRange;
  trip.season = parsed.season;
  trip.partyCount = 1;
  trip.whoWith = ["kids"];

  await trip.save();
  console.log("✅ TripBase patched and saved.");

  // 2. Create TripIntent record for anchor service
  const existingIntent = await TripIntent.findOne({ tripId, userId });
  
  if (existingIntent) {
    console.log("✅ TripIntent already exists, updating...");
    existingIntent.priorities = ["culture", "food"];
    existingIntent.vibes = ["family-friendly", "educational"];
    existingIntent.mobility = ["walking", "metro"];
    existingIntent.travelPace = ["moderate"];
    existingIntent.budget = "mid-range";
    await existingIntent.save();
    console.log("✅ TripIntent updated.");
  } else {
    console.log("✅ Creating new TripIntent...");
    const tripIntent = new TripIntent({
      tripId: new mongoose.Types.ObjectId(tripId),
      userId: userId,
      priorities: ["culture", "food"],
      vibes: ["family-friendly", "educational"],
      mobility: ["walking", "metro"],
      travelPace: ["moderate"],
      budget: "mid-range"
    });
    await tripIntent.save();
    console.log("✅ TripIntent created:", tripIntent._id);
  }

  console.log("🎉 Adam's trip data fully hydrated for anchor service!");
}

run().catch((err) => {
  console.error("💥 Script error:", err);
}).finally(() => {
  mongoose.disconnect();
  console.log("🔌 Disconnected from MongoDB");
});
