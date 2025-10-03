const { getWorkoutType } = require("../../utils/WorkoutTypeUtils");
const { getZonePaces } = require("../../utils/paceUtils");
const { getHRZones } = require("../../utils/HRZoneUtils");
const { getWorkoutLabel } = require("../../utils/WorkoutLabelUtils");
const { getWorkoutSegments } = require("../../utils/SegmentUtils");

function buildDailyWorkout({ day, phase, weekIndex, mileage, current5kPace, age }) {
  const type = getWorkoutType(phase, day, weekIndex);
  const paceZones = getZonePaces(current5kPace);
  const hrZones = getHRZones(age);

  const zoneMap = {
    Easy: "Z2",
    Tempo: "Z3",
    Intervals: "Z4",
    LongRun: "Z2",
    Hills: "Z3",
    RacePace: "Z3",
    OverUnders: "Z3",
    Sharpener: "Z3",
    Recovery: "Z1"
  };

  const zone = zoneMap[type] || "Z2";
  const paceRange = paceZones[zone];
  const hrRange = hrZones[zone];

  return {
    day,
    type,
    zone: parseInt(zone.replace("Z", "")),
    mileage,
    paceRange,
    hrRange,
    label: getWorkoutLabel(type, zone),
    segments: ["Tempo", "Intervals", "RacePace", "OverUnders"].includes(type)
      ? getWorkoutSegments(type, mileage)
      : []
  };
}

module.exports = { buildDailyWorkout };