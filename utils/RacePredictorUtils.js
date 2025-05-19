function getGoalDeltaInSeconds(current5k, goalTime) {
  const toSec = (str) => {
    const [h, m, s] = str.split(":").map(Number);
    return h * 3600 + m * 60 + s;
  };
  return toSec(current5k) - toSec(goalTime);
}

function buildInitialRacePrediction(current5k, raceType, goalTime) {
  const delta = getGoalDeltaInSeconds(current5k, goalTime);
  let difficultyLabel = "unknown";

  if (delta > 180) difficultyLabel = "aggressive";
  else if (delta > 60) difficultyLabel = "challenging";
  else if (delta >= -30) difficultyLabel = "reasonable";
  else difficultyLabel = "you got this";

  return {
    deltaInSeconds: delta,
    difficultyLabel,
    // optionally: paceBands, expected splits, etc.
  };
}

module.exports = {
  getGoalDeltaInSeconds,
  buildInitialRacePrediction,
};
