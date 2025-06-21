const mongoose = require("mongoose");
const TripBase = require("../../models/TripWell/TripBase");

// 🔢 Canon: total day count (inclusive)
function getTripLength(start, end) {
  if (!start || !end) return null;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.round((new Date(end) - new Date(start)) / oneDay) + 1;
}

// 🍂 Canon: get season by start date
function getSeason(dateStr) {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  if ([12, 1, 2].includes(month)) return "Winter";
  if ([3, 4, 5].includes(month)) return "Spring";
  if ([6, 7, 8].includes(month)) return "Summer";
  return "Fall";
}

// 🧠 Canonical TripBase creation
async function createTripBaseWithMetadata({ userId, tripData }) {
  if (!userId || !tripData) throw new Error("Missing userId or trip data");

  const { startDate, endDate } = tripData;
  const season = getSeason(startDate);
  const daysTotal = getTripLength(startDate, endDate);

  const trip = new TripBase({
    ...tripData,
    userId,
    season,
    daysTotal,
  });

  await trip.save(); // ✅ Model hook patches city/destination
  return trip;
}

module.exports = {
  createTripBaseWithMetadata,
};
