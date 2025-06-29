const TripDay = require("../../models/TripWell/TripDay");
const { parseAngelaItinerary } = require("./gptitineraryparserService");

/**
 * Save parsed itinerary data into TripDay collection.
 * @param {string} tripId - Firebase UID or ObjectId (if refactored)
 * @param {string} itineraryString - Raw GPT output from Angela
 * @returns {Promise<number>} Number of days saved
 */
async function saveTripDaysFromAngela(tripId, itineraryString) {
  // Parse GPT output into modal-ready format
  const parsedDays = parseAngelaItinerary(itineraryString);

  // Inject tripId into each parsed day block
  const tripDays = parsedDays.map(day => ({
    ...day,
    tripId
  }));

  // Delete old entries and insert new
  await TripDay.deleteMany({ tripId });
  const created = await TripDay.insertMany(tripDays);
  return created.length;
}

module.exports = { saveTripDaysFromAngela };
