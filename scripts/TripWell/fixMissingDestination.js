const mongoose = require("mongoose");
require("dotenv").config();

const TripBase = require("../../models/TripWell/TripBase");

mongoose.connect(process.env.MONGO_URI, {
  dbName: "GoFastFamily",
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

(async () => {
  try {
    const tripsToFix = await TripBase.find({
      $or: [
        { destination: { $exists: false } },
        { destination: null },
        { destination: "" }
      ]
    });

    console.log(`🔍 Found ${tripsToFix.length} trips missing destination...`);

    let fixedCount = 0;

    for (const trip of tripsToFix) {
      const firstDest = trip.destinations?.[0];
      const newDest = firstDest?.city || trip.tripName || "Unknown";

      trip.destination = newDest;
      await trip.save();
      console.log(`✅ Patched trip ${trip._id}: destination → ${newDest}`);
      fixedCount++;
    }

    console.log(`🎯 Completed. Fixed ${fixedCount} trips.`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error during fix:", err);
    process.exit(1);
  }
})();
