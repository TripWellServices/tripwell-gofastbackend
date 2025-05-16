function getWorkoutLabel(type, zone) {
  const map = {
    Easy: "Easy – Aerobic Builder",
    Tempo: "Tempo – Sharpen",
    Intervals: "Intervals – VO2 Max",
    LongRun: "Long – Endurance",
    Hills: "Hills – Strength Builder",
    RacePace: "Race Pace – Simulation",
    OverUnders: "Over/Under – Lactate Tolerance",
    Sharpener: "Sharpener – Race Ready",
    Recovery: "Recovery – Flush"
  };

  return map[type] || `Zone ${zone}`;
}

module.exports = { getWorkoutLabel };