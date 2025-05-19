const { getPhaseMap } = require("../utils/PhaseUtils");
const { getPhaseMileagePlan } = require("../utils/MilesByPhaseUtils");

function buildTrainingPreview(startDate, raceDate) {
  const totalWeeks = Math.ceil((new Date(raceDate) - new Date(startDate)) / (1000 * 60 * 60 * 24 * 7));
  const phaseMap = getPhaseMap(totalWeeks);
  const phaseMileagePlan = getPhaseMileagePlan(); // returns { Build: 25, Peak: 40, Race: 18 }

  return {
    totalWeeks,
    phaseMap,
    weeksUntilRace: totalWeeks,
    phaseMileagePlan
  };
}

module.exports = { buildTrainingPreview };
