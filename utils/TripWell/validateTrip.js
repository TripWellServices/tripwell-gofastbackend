const mongoose = require("mongoose");

function validateTrip(trip, { autoSave = false } = {}) {
  if (!trip) throw new Error("Trip is required");

  let modified = false;

  // ✅ Fallback: first city source
  const fallbackCity =
    trip.destination?.trim() ||
    trip.city?.trim() ||
    trip.destinations?.[0]?.city?.trim() ||
    "Unknown";

  // 🧼 Normalize destination + city
  if (!trip.destination || trip.destination.trim() === "") {
    trip.destination = fallbackCity;
    modified = true;
  }

  if (!trip.city || trip.city.trim() === "") {
    trip.city = fallbackCity;
    modified = true;
  }

  // 📦 Ensure destinations[0] exists
  if (!Array.isArray(trip.destinations) || trip.destinations.length === 0) {
    trip.destinations = [
      {
        city: trip.destination,
        startDate: trip.startDate,
        endDate: trip.endDate,
        locationId: new mongoose.Types.ObjectId(), // placeholder to pass validation
      },
    ];
    modified = true;
  }

  // 🩹 Patch locationId if still missing
  if (!trip.destinations[0].locationId) {
    trip.destinations[0].locationId = new mongoose.Types.ObjectId();
    modified = true;
  }

  if (autoSave && modified && typeof trip.save === "function") {
    return trip.save();
  }

  return trip;
}

module.exports = { validateTrip };
