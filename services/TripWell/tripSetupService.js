const { differenceInCalendarDays, format } = require("date-fns");

function getSeason(date) {
  if (!date) {
    console.warn("⚠️ getSeason called with null/undefined date");
    return "summer"; // fallback
  }
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    console.warn("⚠️ getSeason called with invalid date:", date);
    return "summer"; // fallback
  }
  
  const month = dateObj.getMonth() + 1;
  console.log("🔍 Computing season for month:", month, "from date:", date);
  
  if ([12, 1, 2].includes(month)) return "winter";
  if ([3, 4, 5].includes(month)) return "spring";
  if ([6, 7, 8].includes(month)) return "summer";
  return "fall";
}

function parseTrip(trip) {
  if (!trip) throw new Error("Trip object is required");

  console.log("🔍 parseTrip called with trip:", {
    tripId: trip._id,
    startDate: trip.startDate,
    endDate: trip.endDate
  });

  const parsed = { ...trip.toObject?.() || trip };

  const start = new Date(parsed.startDate);
  const end = new Date(parsed.endDate);

  console.log("🔍 Parsed dates:", { start, end });

  parsed.daysTotal = differenceInCalendarDays(end, start) + 1;
  parsed.dateRange = `${format(start, "MMM d")} – ${format(end, "MMM d")}`;
  parsed.season = getSeason(start);

  console.log("🔍 Computed values:", {
    daysTotal: parsed.daysTotal,
    season: parsed.season,
    dateRange: parsed.dateRange
  });

  return parsed;
}

module.exports = {
  parseTrip,
};
