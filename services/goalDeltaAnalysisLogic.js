// Goal Delta Analysis Logic
// Evaluates how ambitious a time goal is based on distance-adjusted tolerance

const getTotalMinutes = (timeStr) => {
  const [hh, mm, ss] = timeStr.split(":").map(Number);
  return (hh * 60) + mm + (ss / 60);
};

const deltaThresholdsByDistance = {
  "5k": [1, 2, 4],       // (safe, stretch, savage)
  "10k": [2, 4, 6],
  "10m": [3, 5, 8],
  "half": [5, 10, 15],
  "marathon": [8, 15, 30],
  "other": [5, 10, 20],
};

// Returns difficulty tier + summary message
const analyzeGoalDelta = (recentRaceTime, goalTime, raceType = "half") => {
  const recentMin = getTotalMinutes(recentRaceTime);
  const goalMin = getTotalMinutes(goalTime);
  const delta = recentMin - goalMin;

  const [safe, stretch, savage] = deltaThresholdsByDistance[raceType] || deltaThresholdsByDistance["other"];

  if (delta < 0) {
    return {
      tier: "🚨",
      message: "You're trying to run faster pace over longer distance — rethink the goal.",
    };
  } else if (delta <= safe) {
    return {
      tier: "✅",
      message: "Smart goal — you're tightening up your race.",
    };
  } else if (delta <= stretch) {
    return {
      tier: "🟠",
      message: "Respectable stretch — you'll need solid training.",
    };
  } else if (delta <= savage) {
    return {
      tier: "🔴",
      message: "Bold move — make sure your engine can back it up.",
    };
  } else {
    return {
      tier: "🔥",
      message: "That's a monster leap — staging might be smarter.",
    };
  }
};

module.exports = { analyzeGoalDelta };
