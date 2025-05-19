// services/preTrainingRacePredictorService.js

const TrainingBase = require("../models/TrainingBase");

const raceDistances = {
  "5k": 3.1,
  "10k": 6.2,
  "10m": 10,
  "half": 13.1,
  "marathon": 26.2,
  "other": 13.1,
};

const convert5kToPaceWithFatigue = (fiveKTime, raceDistanceMiles) => {
  const [min, sec] = fiveKTime.split(':').map(Number);
  const totalSeconds = min * 60 + sec;
  let pacePerMile = totalSeconds / 3.1;

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

const preTrainingRacePredictor = async (userId, goalTime) => {
  const base = await TrainingBase.findOne({ userId });
  if (!base || !base.raceType || !base.recent5kTime) {
    throw new Error("Missing training base inputs");
  }

  const distanceMiles = raceDistances[base.raceType];
  const base5k = base.recent5kTime;

  const pace = convert5kToPaceWithFatigue(base5k, distanceMiles);
  const projectedTime = projectRaceTime(pace, distanceMiles);

  // Goal delta
  const goalParts = goalTime.split(':').map(Number);
  const projParts = projectedTime.split(':').map(Number);
  const goalSec = (goalParts.length === 3 ? goalParts[0]*3600 + goalParts[1]*60 + goalParts[2] : goalParts[0]*60 + goalParts[1]);
  const projSec = (projParts.length === 3 ? projParts[0]*3600 + projParts[1]*60 + projParts[2] : projParts[0]*60 + projParts[1]);

  const deltaSec = projSec - goalSec;
  const deltaSign = deltaSec >= 0 ? '+' : '-';
  const deltaAbs = Math.abs(deltaSec);
  const deltaMin = Math.floor(deltaAbs / 60);
  const deltaFinalSec = deltaAbs % 60;
  const deltaStr = `${deltaSign}${deltaMin}:${deltaFinalSec < 10 ? '0' : ''}${deltaFinalSec}`;

  return {
    base5k,
    projectedTime,
    projectedPace: pace,
    deltaFromGoal: deltaStr,
  };
};

module.exports = preTrainingRacePredictor;
