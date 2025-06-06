const mongoose = require("mongoose");
require("dotenv").config();

const TripBase = require("../../models/TripWell/TripBase");

const TRIP_ID = "683facd5a84346dd938bf345"; // 🎯 Your specific trip

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

    // ✍️ Update primary fields
    trip.destination = "Paris";
    trip.city = "Paris";

    // 💥 Fill in destinations with placeholder locationId
    if (!trip.destinations || trip.destinations.length === 0) {
      trip.destinations = [
        {
          city: "Paris",
          startDate: trip.startDate,
          endDate: trip.endDate,
          locationId: new mongoose.Types.ObjectId(), // 🩹 Fake ID to pass validation
        },
      ];
      console.log("🛠️ Patched destinations array with Paris + placeholder locationId");
    }

    await trip.save();
    console.log(`✅ Trip ${TRIP_ID} fully patched: city, destination, and destinations[]`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error patching trip:", err);
    process.exit(1);
  }
})();
