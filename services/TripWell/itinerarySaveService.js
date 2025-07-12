const TripDay = require("../../models/TripWell/TripDay");
const { parseAngelaItinerary } = require("./gptitineraryparserService");

/**
 * Save parsed GPT itinerary into the TripDay collection.
 * Skips "Day 0" (typically a travel day).
 *
 * @param {string} tripId - The MongoDB trip ID
 * @param {string} itineraryString - Raw GPT output string from Angela
 * @returns {Promise<number>} - Count of days saved
 */
async function saveTripDaysGpt(tripId, itineraryString) {
  const parsedDays = parseAngelaItinerary(itineraryString);

  const filteredDays = parsedDays.filter(
    (day) => day.dayIndex !== 0 && !/^Day 0\b/.test(day.label)
  );

  const tripDays = filteredDays.map((day) => ({
    ...day,
    tripId,
  }));

  await TripDay.deleteMany({ tripId });
  const created = await TripDay.insertMany(tripDays);

  return created.length;
}

module.exports = { saveTripDaysGpt };
