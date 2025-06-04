function formatDateRange(start, end) {
  if (!start || !end) return "";
  const options = { month: "short", day: "numeric" };
  const startStr = new Date(start).toLocaleDateString("en-US", options);
  const endStr = new Date(end).toLocaleDateString("en-US", options);
  return `${startStr} – ${endStr}`;
}

function getTripLength(start, end) {
  if (!start || !end) return null;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.round((new Date(end) - new Date(start)) / oneDay) + 1;
}

function getSeason(dateStr) {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  if ([12, 1, 2].includes(month)) return "Winter";
  if ([3, 4, 5].includes(month)) return "Spring";
  if ([6, 7, 8].includes(month)) return "Summer";
  return "Fall";
}

function parseTrip(tripDoc) {
  const dest = tripDoc.destinations?.[0] || {};

  const start = dest.startDate || tripDoc.startDate;
  const end = dest.endDate || tripDoc.endDate;

  return {
    _id: tripDoc._id,
    tripName: tripDoc.tripName,
    purpose: tripDoc.purpose,
    joinCode: tripDoc.joinCode,
    isMultiCity: tripDoc.isMultiCity,
    createdAt: tripDoc.createdAt,
    city: dest.city || tripDoc.tripName || "Unknown",
    startDate: start,
    endDate: end,
    dateRange: formatDateRange(start, end),
    daysTotal: getTripLength(start, end),
    season: getSeason(start)
  };
}

module.exports = { parseTrip };
