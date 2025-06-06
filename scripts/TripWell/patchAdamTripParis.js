const mongoose = require("mongoose");
require("dotenv").config();

const TripBase = require("../../models/TripWell/TripBase");

const TRIP_ID = "683facd5a84346dd938bf345"; // 🔍 Specific trip you're patching

mongoose.connect(process.env.MONGO_URI, {
  dbName: "GoFastFamily",
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

(async () => {
  try {
    const trip = await TripBase.findById(TRIP_ID);
    if (!trip) {
      console.error(`❌ Trip ${TRIP_ID} not found`);
      process.exit(1);
    }

    // 🩺 Patch core fields
    trip.destination = "Paris";
    trip.city = "Paris";

    // 💾 Patch destinations if empty or undefined
    if (!trip.destinations || !trip.destinations.length) {
      trip.destinations = [
        {
          city: "Paris",
          startDate: trip.startDate,
          endDate: trip.endDate,
        },
      ];
      console.log(`🛠️ Destinations array created with Paris`);
    }

    await trip.save();

    console.log(`✅ Trip ${TRIP_ID} patched: destination, city, and destinations[] now set`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error patching trip:", err);
    process.exit(1);
  }
})();
