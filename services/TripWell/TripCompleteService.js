const CompletedTrip = require("../../models/TripWell/CompletedTrip");
const TripBase = require("../../models/TripWell/TripBase");

async function markTripAsComplete(tripId, userId) {
  const existing = await CompletedTrip.findOne({ tripId, userId });
  if (existing) return existing; // already logged

  const tripBase = await TripBase.findById(tripId);
  if (!tripBase) throw new Error("TripBase not found");

  const archive = await CompletedTrip.create({
    tripId,
    userId,
    destination: tripBase.destination,
    completedAt: new Date()
  });

  return archive;
}

module.exports = { markTripAsComplete };
