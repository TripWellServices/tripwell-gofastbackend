// services/TripWell/tripDayFinalizerService.js

const TripDay = require("../../models/TripWell/TripDay");

async function finalizeTripDay({ tripId, dayIndex, summary, blocks }) {
  if (!tripId || typeof dayIndex !== "number") {
    throw new Error("Missing or invalid tripId/dayIndex");
  }

  if (!summary || typeof blocks !== "object") {
    throw new Error("Missing summary or blocks");
  }

  const updated = await TripDay.findOneAndUpdate(
    { tripId, dayIndex },
    { summary, blocks },
    { new: true }
  );

  if (!updated) {
    throw new Error("Trip day not found");
  }

  return updated;
}

module.exports = { finalizeTripDay };
