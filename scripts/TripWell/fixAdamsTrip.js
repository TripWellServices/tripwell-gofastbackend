const mongoose = require("mongoose");
const TripBase = require("../../models/TripWell/TripBase");
const { parseTrip } = require("../../services/TripWell/tripSetupService");

require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI;

async function run() {
  console.log("🌐 Connecting to Mongo:", MONGO_URI);
  await mongoose.connect(MONGO_URI);
  console.log("✅ Mongo connected:", mongoose.connection.name);

  const tripId = "683facd5a84346dd938bf345"; // 👈 Real ObjectId
  const userId = "5m5XpT4J6Qf8B2tMUawHBKbvKbA2"; // 👈 Real Firebase UID

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
  trip.whoWith = ["Daughter"];

  await trip.save();
  console.log("✅ Trip patched and saved.");
}

run().catch((err) => {
  console.error("💥 Script error:", err);
});
