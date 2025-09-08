const TripDay = require("../../models/TripWell/TripDay");
const { parseAngelaItinerary } = require("./gptItineraryParserService");

/**
 * Save parsed GPT itinerary into the TripDay collection.
 * Skips "Day 0" (typically a travel day).
 *
 * @param {string} tripId - The MongoDB trip ID
 * @param {string} itineraryString - Raw GPT output string from Angela
 * @returns {Promise<number>} - Count of days saved
 */
async function saveTripDaysGpt(tripId, itineraryString) {
  console.log("🔍 Raw itinerary string length:", itineraryString.length);
  console.log("🔍 Raw itinerary string preview:", itineraryString.substring(0, 500));
  
  const parsedDays = parseAngelaItinerary(itineraryString);
  console.log("🔍 Parsed days count:", parsedDays.length);
  console.log("🔍 Parsed days:", JSON.stringify(parsedDays, null, 2));

  const filteredDays = parsedDays.filter(
    (day) => day.dayIndex !== 0 && !/^Day 0\b/.test(day.label)
  );
  console.log("🔍 Filtered days count:", filteredDays.length);
  console.log("🔍 Filtered days:", JSON.stringify(filteredDays, null, 2));

  const tripDays = filteredDays.map((day) => ({
    ...day,
    tripId,
  }));

  await TripDay.deleteMany({ tripId });
  const created = await TripDay.insertMany(tripDays);
  console.log("🔍 Created TripDay documents:", created.length);

  return created.length;
}

module.exports = { saveTripDaysGpt };
