function generateMileagePlan({ totalWeeks, stressMode, peakMileage = 50 }) {
  const mileagePlan = [];
  let startMileage = 25;
  const mileageIncrement = (peakMileage - startMileage) / (totalWeeks - 3); // last 3 weeks = taper

  for (let week = 1; week <= totalWeeks; week++) {
    if (week <= totalWeeks - 3) {
      const weeklyMileage = Math.round(startMileage + mileageIncrement * (week - 1));
      mileagePlan.push(weeklyMileage);
    } else {
      const taperDrop = [0.7, 0.5, 0.3]; // progressive taper
      const taperMileage = Math.round(peakMileage * taperDrop[week - (totalWeeks - 3)]);
      mileagePlan.push(taperMileage);
    }
  }

  return mileagePlan;
}

module.exports = { generateMileagePlan };
