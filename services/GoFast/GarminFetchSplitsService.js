const axios = require("axios");

const getGarminActivityDetails = async (userId, activityId) => {
  const GARMIN_API_KEY = process.env.GARMIN_API_KEY;
  const GARMIN_SECRET = process.env.GARMIN_SECRET;

  const response = await axios.get(
    `https://apis.garmin.com/wellness-api/rest/activityDetails/${userId}?activityId=${activityId}`,
    {
      headers: {
        "Authorization": `Bearer ${GARMIN_API_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );

  const laps = response.data.laps || [];
  const splits = laps.map((lap, index) => {
    const miles = lap.distanceInMeters / 1609.34;
    const minutes = lap.durationInSeconds / 60;
    const pace = minutes / miles;
    const paceMin = Math.floor(pace);
    const paceSec = Math.round((pace - paceMin) * 60);
    return {
      mile: index + 1,
      pace: `${paceMin}:${paceSec.toString().padStart(2, '0')}`,
      hr: lap.averageHeartRateInBeatsPerMinute
    };
  });

  return splits;
};

module.exports = { getGarminActivityDetails };
