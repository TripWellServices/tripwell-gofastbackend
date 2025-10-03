const { getHRZones } = require('../utils/HRZoneUtils');
const { getTrainingPaces } = require('../utils/PaceUtils');
const { getTargetHRZone } = require('../utils/WorkoutIntentMapper');

const scoreRun = (activity, planned) => {
  if (!planned || !activity.avgHr || !activity.pace) return null;

  const mileage = activity.mileage || 0;
  const avgHR = activity.avgHr;
  const avgPace = activity.pace;
  const hrZones = getHRZones();

  const trainingPaces = getTrainingPaces(planned); // uses adaptive 5K
  const targetPace = trainingPaces[planned.type];

  const targetHRZoneName = getTargetHRZone(planned.type);
  if (!targetHRZoneName || !hrZones[targetHRZoneName]) return null; // skip non-run workouts

  const zone = hrZones[targetHRZoneName];
  const hrMatch = avgHR >= zone.min && avgHR <= zone.max;

  const paceMatch = Math.abs(toSeconds(avgPace) - toSeconds(targetPace)) <= 20;

  let scorePerMile = 0;

  if (paceMatch && hrMatch) scorePerMile = 1.0;
  else if (paceMatch && !hrMatch) scorePerMile = 0.5; // grit
  else if (!paceMatch && hrMatch) scorePerMile = 0.3; // underpaced
  else scorePerMile = 0.1;

  return {
    mileage,
    score: scorePerMile,
    aligned: paceMatch && hrMatch,
    grit: paceMatch && !hrMatch,
    note: `${planned.type} | HR zone: ${targetHRZoneName}`
  };
};

const toSeconds = (str) => {
  const [min, sec] = str.split(':').map(Number);
  return min * 60 + sec;
};

module.exports = { scoreRun };
