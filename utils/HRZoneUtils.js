const HR_ZONES = {
  Z1: { min: 90, max: 109 },
  Z2: { min: 110, max: 139 },
  Z3: { min: 140, max: 159 },
  Z4: { min: 160, max: 179 },
  Z5: { min: 180, max: 200 }
};

const getHRZones = () => HR_ZONES;

const getZoneForHR = (bpm) => {
  for (const [zone, range] of Object.entries(HR_ZONES)) {
    if (bpm >= range.min && bpm <= range.max) return zone;
  }
  return 'unclassified';
};

module.exports = {
  getHRZones,
  getZoneForHR
};