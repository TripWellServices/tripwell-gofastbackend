// scripts/TripWell/fixAdamsTrip.js

const mongoose = require("mongoose");
const TripBase = require("../../models/TripWell/TripBase");

require("dotenv").config();

async function fixAdamsTrip() {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // 🔒 Hardcoded known trip ID from Adam's tripBase
  const tripId = "683facd5a84346dd938bf345";

  const trip = await TripBase.findById(tripId);

  if (!trip) {
    console.error("❌ Trip not found.");
    await mongoose.disconnect();
    return;
  }

  trip.daysTotal = 5;
  trip.season = "summer";
  trip.whoWith = ["Daughter"];
  trip.partyCount = 1;

  await trip.save();

  console.log(`✅ Trip patched: ${trip._id}`);
  console.log({
    daysTotal: trip.daysTotal,
    season: trip.season,
    whoWith: trip.whoWith,
    partyCount: trip.partyCount,
  });

  await mongoose.disconnect();
  console.log("🔥 Done.");
}

fixAdamsTrip().catch((err) => {
  console.error("💥 Script failed:", err);
  process.exit(1);
});
