// utils/planUtils.js

/**
 * Calculate number of weeks between today and race date
 * Returns an integer, rounded down.
 */
export function getWeeksUntilRace(currentDate, raceDate) {
  const msPerWeek = 1000 * 60 * 60 * 24 * 7;
  const diffInMs = new Date(raceDate) - new Date(currentDate);
  return Math.floor(diffInMs / msPerWeek);
}

/**
 * Convert goalTime string (e.g. "01:45:00") to average pace per mile based on race type.
 * Returns a string like "7:45 per mile".
 */
export function parseGoalPace(goalTime, raceType) {
  const raceDistances = {
    "5k": 3.1,
    "10k": 6.2,
    "10m": 10,
    "half": 13.1,
    "marathon": 26.2,
    "other": 13.1, // default to half marathon for now
  };

  const [hours, minutes, seconds] = goalTime.split(":").map(Number);
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;
  const distance = raceDistances[raceType] || 13.1;

  const paceInSeconds = totalSeconds / distance;
  const paceMin = Math.floor(paceInSeconds / 60);
  const paceSec = Math.round(paceInSeconds % 60).toString().padStart(2, "0");

  return `${paceMin}:${paceSec} per mile`;
}
// Converts current 5K time into pace per mile
export function paceFromCurrent5k(current5kTime) {
  const [hh, mm, ss] = current5kTime.split(":").map(Number);
  const totalSeconds = (hh * 3600) + (mm * 60) + ss;

  const pacePerMileSec = totalSeconds / 3.1; // 5K is 3.1 miles
  const paceMin = Math.floor(pacePerMileSec / 60);
  const paceSec = Math.round(pacePerMileSec % 60).toString().padStart(2, "0");

  return `${paceMin}:${paceSec} per mile`;
}
export function getTrainingPhase(weekNumber, totalWeeks) {
  if (weekNumber > totalWeeks - 2) return "Taper";
  if (weekNumber > totalWeeks - 4) return "Peak";
  return "Build";
}
