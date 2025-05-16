function getWorkoutSegments(type, mileage) {
  if (type === "Tempo") {
    return [
      { type: "warmup", mileage: 1.5 },
      { type: "interval", reps: 3, duration: "6 min", targetPace: "tempo", recovery: "2 min jog" },
      { type: "cooldown", mileage: 1.5 }
    ];
  }

  if (type === "Over-Unders") {
    return [
      { type: "warmup", mileage: 1 },
      { type: "block", reps: 4, structure: "3 min Zone 3 / 2 min Zone 4", recovery: "90 sec jog" },
      { type: "cooldown", mileage: 1 }
    ];
  }

  return [];
}

module.exports = { getWorkoutSegments };