function getWorkoutType(phase, day, weekIndex) {
  if (phase === "Build") {
    if (day === "Tuesday") return weekIndex < 4 ? "Hills" : "Tempo";
    if (day === "Saturday") return "Long Run";
    return "Easy";
  }

  if (phase === "Peak") {
    if (day === "Tuesday") return "Tempo";
    if (day === "Thursday") return (weekIndex % 2 === 0) ? "Over-Unders" : "Intervals";
    if (day === "Saturday") return "Race Pace";
    return "Easy";
  }

  if (phase === "Taper") {
    if (day === "Tuesday") return "Sharpener";
    return "Recovery";
  }

  return "Easy";
}

module.exports = { getWorkoutType };