
const RaceSelfAssessment = require('../../models/RaceSelfAssessment');
const RaceResult = require('../../models/RaceResult');

function paceToSeconds(paceStr) {
  if (!paceStr || !paceStr.includes(":")) return null;
  const [min, sec] = paceStr.split(":").map(Number);
  return min * 60 + sec;
}

export async function getGoalStatus(userId) {
  const locked = await RaceSelfAssessment.findOne({ userId });
  const result = await RaceResult.findOne({ userId }).sort({ submittedAt: -1 });

  if (!result) return 'none';
  if (!locked || !locked.lockedPace) return 'none';

  const lockedSec = paceToSeconds(locked.lockedPace);
  const actualSec = paceToSeconds(result.averagePace);
  if (!lockedSec || !actualSec) return 'none';

  const delta = Math.abs(lockedSec - actualSec);

  if (delta <= 5) return 'hit';
  if (delta <= 20) return 'close';
  return 'miss';
}