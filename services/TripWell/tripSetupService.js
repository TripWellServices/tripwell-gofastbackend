// services/TripWell/tripSetupService.js

const { differenceInCalendarDays, format } = require("date-fns");

function getSeason(date) {
  const month = new Date(date).getMonth() + 1;
  if ([12, 1, 2].includes(month)) return "winter";
  if ([3, 4, 5].includes(month)) return "spring";
  if ([6, 7, 8].includes(month)) return "summer";
  return "fall";
}

function parseTrip(trip) {
  if (!trip) throw new Error("Trip object is required");

  const parsed = { ...trip.toObject?.() || trip };

  const start = new Date(parsed.startDate);
  const end = new Date(parsed.endDate);

  // Normalize city + destination
  const fallbackCity =
    parsed.destination?.trim() ||
    parsed.city?.trim() ||
    parsed.destinations?.[0]?.city?.trim() ||
    "Unknown";

  parsed.city = fallbackCity;
  parsed.destination = fallbackCity;

  // Add day count
  parsed.daysTotal = differenceInCalendarDays(end, start) + 1;

  // Format range string
  parsed.dateRange = `${format(start, "MMM d")} – ${format(end, "MMM d")}`;

  // Season
  parsed.season = getSeason(start);

  return parsed;
}

module.exports = {
  parseTrip,
};
