// services/raceFinishPredictorService.js
import { getMostRecentAdaptive5k } from './adaptive5kLoggerService.js'; // 🔥 this is the fix

const convert5kToPaceWithFatigue = (fiveKTime, raceDistanceMiles) => {
  const [min, sec] = fiveKTime.split(':').map(Number);
  const totalSeconds = min * 60 + sec;
  let pacePerMile = totalSeconds / 3.1;

  // Add 10 seconds per 10K beyond 5K
  const fatiguePenalty = Math.floor((raceDistanceMiles - 3.1) / 6.2) * 10;
  pacePerMile += fatiguePenalty;

  const paceMin = Math.floor(pacePerMile / 60);
  const paceSec = Math.round(pacePerMile % 60);
  return `${paceMin}:${paceSec < 10 ? '0' : ''}${paceSec}`;
};

const projectRaceTime = (pace, distanceMiles) => {
  const [min, sec] = pace.split(':').map(Number);
  const totalSeconds = (min * 60 + sec) * distanceMiles;
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.round(totalSeconds % 60);
  return `${hrs > 0 ? hrs + ':' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export const raceFinishPredictor = async (userId, raceDistanceMiles, goalTime) => {
  const base5k = await getMostRecentAdaptive5k(userId); // 💯 now pulling from Adaptive5kPace
  if (!base5k) throw new Error('No adaptive 5K time found');

  const pace = convert5kToPaceWithFatigue(base5k, raceDistanceMiles);
  const projectedTime = projectRaceTime(pace, raceDistanceMiles);

  // Calculate delta
  const goalParts = goalTime.split(':').map(Number);
  const projParts = projectedTime.split(':').map(Number);
  const goalSec = (goalParts.length === 3 ? goalParts[0] * 3600 + goalParts[1] * 60 + goalParts[2] : goalParts[0] * 60 + goalParts[1]);
  const projSec = (projParts.length === 3 ? projParts[0] * 3600 + projParts[1] * 60 + projParts[2] : projParts[0] * 60 + projParts[1]);

  const deltaSec = projSec - goalSec;
  const deltaSign = deltaSec >= 0 ? '+' : '-';
  const deltaAbs = Math.abs(deltaSec);
  const deltaMin = Math.floor(deltaAbs / 60);
  const deltaFinalSec = deltaAbs % 60;
  const deltaStr = `${deltaSign}${deltaMin}:${deltaFinalSec < 10 ? '0' : ''}${deltaFinalSec}`;

  return {
    base5k,               // MM:SS from logger
    projectedTime,        // race prediction
    projectedPace: pace,  // adjusted pace
    deltaFromGoal: deltaStr
  };
};
