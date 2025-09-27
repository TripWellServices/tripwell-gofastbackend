// services/TripWell/tripLiveHydratorService.js

const TripCurrentDays = require("../../models/TripWell/TripCurrentDays");

async function getNextIncompleteTripCurrentDays(tripId) {
  try {
    const nextDay = await TripCurrentDays.findOne({
      tripId,
      complete: { $ne: true }
    }).sort({ dayIndex: 1 });

    return nextDay || null;
  } catch (err) {
    console.error("TripLive hydration error:", err);
    throw new Error("Failed to fetch next TripLive day");
  }
}

module.exports = { getNextIncompleteTripCurrentDays };
