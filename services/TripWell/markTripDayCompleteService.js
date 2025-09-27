// services/TripWell/markTripDayCompleteService.js

const TripCurrentDays = require("../../models/TripWell/TripCurrentDays");

async function markTripDayComplete(tripId, dayIndex) {
  try {
    const result = await TripCurrentDays.findOneAndUpdate(
      { tripId, dayIndex },
      { $set: { complete: true } },
      { new: true }
    );

    if (!result) throw new Error("TripCurrentDays not found for update");

    return result;
  } catch (err) {
    console.error("TripLive completion error:", err);
    throw new Error("Failed to mark TripCurrentDays as complete");
  }
}

module.exports = { markTripDayComplete };
