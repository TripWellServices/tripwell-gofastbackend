const GarminActivity = require("../../models/Archive/GarminActivity-OLD");

const calculatePace = (distanceMeters, durationSeconds) => {
  const distanceMiles = distanceMeters / 1609.34;
  const durationMinutes = durationSeconds / 60;
  const pace = durationMinutes / distanceMiles;

  const min = Math.floor(pace);
  const sec = Math.round((pace - min) * 60);
  return `${min}:${sec.toString().padStart(2, '0')}`;
};

const saveGarminActivity = async (userId, activity) => {
  const activityDate = activity.summaryStartTimeLocal.split("T")[0];
  const mileage = activity.distance / 1609.34;
  const duration = activity.duration / 60;
  const pace = calculatePace(activity.distance, activity.duration);
  const avgHr = activity.avgHR;

  return await GarminActivity.create({
    userId,
    activityDate,
    mileage,
    duration,
    pace,
    avgHr,
    raw: activity
  });
};

module.exports = { saveGarminActivity };
