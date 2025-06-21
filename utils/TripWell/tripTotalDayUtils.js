// utils/TripWell/tripTotalDayUtils.js

function getTripDuration(startDate, endDate) {
  if (!startDate || !endDate) return 0;
  const msPerDay = 1000 * 60 * 60 * 24;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = Math.ceil((end - start) / msPerDay);
  return Math.max(1, diff + 1); // Inclusive range
}

function getDateDifference(date1, date2) {
  if (!date1 || !date2) return 0;
  const msPerDay = 1000 * 60 * 60 * 24;
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.round((d2 - d1) / msPerDay);
}

module.exports = {
  getTripDuration,
  getDateDifference,
};
