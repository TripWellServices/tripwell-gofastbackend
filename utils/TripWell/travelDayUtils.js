// utils/TripWell/travelDayUtils.js

function isTravelDay(date, startDate) {
  if (!date || !startDate) return false;
  const d1 = new Date(date).toDateString();
  const d2 = new Date(startDate).toDateString();
  return d1 === d2;
}

function getDayLabel(index) {
  return `Day ${index + 1}`;
}

function formatTripDates(startDate, endDate) {
  if (!startDate || !endDate) return "";
  const options = { month: "long", day: "numeric" };
  const start = new Date(startDate).toLocaleDateString(undefined, options);
  const end = new Date(endDate).toLocaleDateString(undefined, options);
  return `${start} – ${end}`;
}

module.exports = {
  isTravelDay,
  getDayLabel,
  formatTripDates,
};
