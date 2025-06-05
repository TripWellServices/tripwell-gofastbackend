const mongoose = require("mongoose");
require("dotenv").config();

const TripBase = require("../../models/TripWell/TripBase");

const TRIP_ID = "683facd5a84346dd938bf345"; // <---- your specific ObjectId here

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

    trip.destination = "Paris";
    trip.city = "Paris"; // if you want to keep city synced too

    await trip.save();

    console.log(`✅ Trip ${TRIP_ID} patched: destination & city → Paris`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error patching trip:", err);
    process.exit(1);
  }
})();
