// services/TripWell/markTripDayCompleteService.js

const TripDay = require("../../models/TripWell/TripDay");

async function markTripDayComplete(tripId, dayIndex) {
  try {
    const result = await TripDay.findOneAndUpdate(
      { tripId, dayIndex },
      { $set: { complete: true } },
      { new: true }
    );

    if (!result) throw new Error("TripDay not found for update");

    return result;
  } catch (err) {
    console.error("TripLive completion error:", err);
    throw new Error("Failed to mark TripDay as complete");
  }
}

module.exports = { markTripDayComplete };
