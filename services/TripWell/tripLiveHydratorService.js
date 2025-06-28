// services/TripWell/tripLiveHydratorService.js

const TripDay = require("../../models/TripWell/TripDay");

async function getNextIncompleteTripDay(tripId) {
  try {
    const nextDay = await TripDay.findOne({
      tripId,
      complete: { $ne: true }
    }).sort({ dayIndex: 1 });

    return nextDay || null;
  } catch (err) {
    console.error("TripLive hydration error:", err);
    throw new Error("Failed to fetch next TripLive day");
  }
}

module.exports = { getNextIncompleteTripDay };
