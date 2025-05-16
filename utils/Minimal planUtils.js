function calculateWeeksUntilRace(raceDateStr) {
  const today = new Date();
  const raceDate = new Date(raceDateStr);
  const diffMs = raceDate - today;
  const diffWeeks = Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 7));
  return Math.max(diffWeeks, 1);
}

function getPhaseByIndex(index, phases) {
  const { build, peak, taper } = phases;
  if (index < build) return 'Build';
  if (index < build + peak) return 'Peak';
  return 'Taper';
}

module.exports = { calculateWeeksUntilRace, getPhaseByIndex };