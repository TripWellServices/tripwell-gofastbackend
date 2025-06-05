const mongoose = require("mongoose");
const { parseTrip } = require("../../services/TripWell/tripParser"); // your existing parser
require("dotenv").config();

const TripBase = require("../../models/TripWell/TripBase");

mongoose.connect(process.env.MONGO_URI, {
  dbName: "GoFastFamily",
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

(async () => {
  try {
    const trips = await TripBase.find({});
    console.log(`🔍 Found ${trips.length} trips...`);

    let patched = 0;

    for (const trip of trips) {
      const parsed = parseTrip(trip);

      if (parsed.city && (parsed.city !== trip.city || parsed.city !== trip.destination)) {
        trip.city = parsed.city;
        trip.destination = parsed.city; // optional mirror
        await trip.save();
        console.log(`✅ Patched trip ${trip._id}: city & destination → ${parsed.city}`);
        patched++;
      }
    }

    console.log(`🎯 Completed. ${patched} trips patched out of ${trips.length} total.`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error during patch:", err);
    process.exit(1);
  }
})();
