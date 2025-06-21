function getSeasonFromDateRange(startDateStr, endDateStr) {
  if (!startDateStr) return null;

  const month = new Date(startDateStr).getMonth(); // 0-indexed: Jan = 0
  if ([11, 0, 1].includes(month)) return "winter";
  if ([2, 3, 4].includes(month)) return "spring";
  if ([5, 6, 7].includes(month)) return "summer";
  if ([8, 9, 10].includes(month)) return "fall";

  return null;
}

module.exports = { getSeasonFromDateRange };