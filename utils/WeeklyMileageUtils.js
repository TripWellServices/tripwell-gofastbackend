function getWeeklyMileagePlan(baseMileage, totalWeeks) {
  const ramp = 0.06;
  const deloadEvery = 4;
  let mileage = baseMileage;
  const plan = [];

  for (let i = 0; i < totalWeeks; i++) {
    if (i > 0 && i % deloadEvery === 0) {
      mileage *= 0.85; // deload
    } else if (i > 0) {
      mileage *= (1 + ramp);
    }
    plan.push(Math.round(mileage));
  }

  return plan;
}

module.exports = { getWeeklyMileagePlan };