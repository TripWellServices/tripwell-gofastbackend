function getPhaseMap(totalWeeks) {
  const taperWeeks = 2;
  const peakWeeks = 4;
  const buildWeeks = totalWeeks - peakWeeks - taperWeeks;

  return [
    { name: "Build", weeks: Array.from({length: buildWeeks}, (_, i) => i + 1) },
    { name: "Peak", weeks: Array.from({length: peakWeeks}, (_, i) => i + 1 + buildWeeks) },
    { name: "Taper", weeks: Array.from({length: taperWeeks}, (_, i) => i + 1 + buildWeeks + peakWeeks) }
  ];
}

function getPhaseForWeek(weekIndex, phaseMap) {
  const week = weekIndex + 1;
  return phaseMap.find(p => p.weeks.includes(week))?.name || "Unknown";
}

module.exports = { getPhaseMap, getPhaseForWeek };