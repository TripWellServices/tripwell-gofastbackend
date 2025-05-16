function getLongRunMileage(weeklyMileage) {
  return Math.round(weeklyMileage * 0.3);
}

module.exports = { getLongRunMileage };