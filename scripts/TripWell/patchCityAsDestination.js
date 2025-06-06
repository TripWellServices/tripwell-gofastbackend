const mongoose = require("mongoose");
require("dotenv").config();

// ✅ Adjust this path to your actual Trip model
const Trip = require("../../models/TripWell/Trip");

async function patchDestinations() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("🔌 Connected to MongoDB");

    const trips = await Trip.find({
      $or: [
        { destinations: { $exists: false } },
        { destinations: { $size: 0 } },
      ],
      isMultiCity: false,
    });

    if (!trips.length) {
      console.log("✅ No patch needed. All trips already have destinations.");
      return mongoose.disconnect();
    }

    for (const trip of trips) {
      const fallbackCity = trip.city || trip.destination;
      if (!fallbackCity) {
        console.warn("⚠️ Skipping trip with no city:", trip._id.toString());
        continue;
      }

      trip.destinations = [
        {
          city: fallbackCity,
          startDate: trip.startDate,
          endDate: trip.endDate,
        },
      ];

      await trip.save();
      console.log("✅ Patched trip:", trip._id.toString());
    }

    console.log("🎉 All eligible trips patched.");
  } catch (err) {
    console.error("❌ Patch error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected");
  }
}

patchDestinations();
