const Race = require('../models/GoFast/Race');

/**
 * RaceService - Handles race creation, updates, and predictions
 */

/**
 * Create a new race for a user
 */
const createRace = async ({
  userId,
  raceName,
  raceType,
  raceDate,
  goalTime,
  baseline5k,
  baselineWeeklyMileage,
  location
}) => {
  // Calculate distance in miles
  const distanceMap = {
    '5k': 3.1,
    '10k': 6.2,
    '10m': 10,
    'half': 13.1,
    'marathon': 26.2
  };
  
  const distanceMiles = distanceMap[raceType] || 13.1;
  
  // Calculate goal pace
  const goalPace = calculatePaceFromTime(goalTime, distanceMiles);
  
  // Calculate weeks away
  const weeksAway = calculateWeeksUntilRace(raceDate);
  
  // Create race
  const race = await Race.create({
    userId,
    raceName,
    raceType,
    raceDate: new Date(raceDate),
    goalTime,
    goalPace,
    baseline5k,
    baselineWeeklyMileage,
    distanceMiles,
    weeksAway,
    location,
    status: 'planning'
  });
  
  return race;
};

/**
 * Get active race for user
 */
const getActiveRace = async (userId) => {
  return await Race.findOne({ 
    userId, 
    status: { $in: ['planning', 'training', 'taper', 'race_week'] }
  }).sort({ raceDate: 1 });
};

/**
 * Get race by ID
 */
const getRaceById = async (raceId) => {
  return await Race.findById(raceId);
};

/**
 * Update race prediction (called during training)
 */
const updateRacePrediction = async (raceId, adaptive5kTime) => {
  const race = await Race.findById(raceId);
  if (!race) throw new Error('Race not found');
  
  // Calculate new prediction based on adaptive 5k
  const prediction = calculateRacePrediction(
    adaptive5kTime,
    race.distanceMiles,
    race.goalTime
  );
  
  race.currentPrediction = {
    adaptive5kTime,
    projectedTime: prediction.projectedTime,
    projectedPace: prediction.projectedPace,
    deltaFromGoal: prediction.deltaFromGoal,
    confidence: prediction.confidence,
    lastUpdated: new Date()
  };
  
  await race.save();
  return race;
};

/**
 * Update race status
 */
const updateRaceStatus = async (raceId, status) => {
  const race = await Race.findByIdAndUpdate(
    raceId,
    { status, updatedAt: new Date() },
    { new: true }
  );
  
  return race;
};

/**
 * Submit race result
 */
const submitRaceResult = async (raceId, resultData) => {
  const race = await Race.findById(raceId);
  if (!race) throw new Error('Race not found');
  
  race.actualResult = {
    finishTime: resultData.finishTime,
    pace: calculatePaceFromTime(resultData.finishTime, race.distanceMiles),
    placement: resultData.placement,
    ageGroupPlacement: resultData.ageGroupPlacement,
    notes: resultData.notes,
    completedAt: new Date()
  };
  
  race.status = 'completed';
  await race.save();
  
  return race;
};

/**
 * Get all races for user
 */
const getUserRaces = async (userId) => {
  return await Race.find({ userId }).sort({ raceDate: -1 });
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Calculate pace from time and distance
 */
const calculatePaceFromTime = (timeStr, distanceMiles) => {
  // Parse time string (e.g., "1:45:00" or "45:00")
  const parts = timeStr.split(':').map(Number);
  let totalSeconds;
  
  if (parts.length === 3) {
    totalSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    totalSeconds = parts[0] * 60 + parts[1];
  } else {
    totalSeconds = parts[0];
  }
  
  const paceSeconds = totalSeconds / distanceMiles;
  const paceMin = Math.floor(paceSeconds / 60);
  const paceSec = Math.round(paceSeconds % 60);
  
  return `${paceMin}:${paceSec < 10 ? '0' : ''}${paceSec}`;
};

/**
 * Calculate weeks until race
 */
const calculateWeeksUntilRace = (raceDate) => {
  const now = new Date();
  const race = new Date(raceDate);
  const diffTime = race - now;
  const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
  return diffWeeks > 0 ? diffWeeks : 0;
};

/**
 * Calculate race prediction from adaptive 5k time
 */
const calculateRacePrediction = (adaptive5kTime, raceDistanceMiles, goalTime) => {
  // Convert 5k time to seconds
  const [min, sec] = adaptive5kTime.split(':').map(Number);
  const total5kSeconds = min * 60 + sec;
  
  // Calculate base pace per mile
  let pacePerMile = total5kSeconds / 3.1;
  
  // Add fatigue penalty: 10 seconds per 10k beyond 5k
  const fatiguePenalty = Math.floor((raceDistanceMiles - 3.1) / 6.2) * 10;
  pacePerMile += fatiguePenalty;
  
  // Project race time
  const projectedSeconds = pacePerMile * raceDistanceMiles;
  const projectedTime = secondsToTimeString(projectedSeconds);
  
  // Calculate pace
  const paceMin = Math.floor(pacePerMile / 60);
  const paceSec = Math.round(pacePerMile % 60);
  const projectedPace = `${paceMin}:${paceSec < 10 ? '0' : ''}${paceSec}`;
  
  // Calculate delta from goal
  const goalSeconds = timeStringToSeconds(goalTime);
  const deltaSeconds = projectedSeconds - goalSeconds;
  const deltaStr = formatDelta(deltaSeconds);
  
  // Determine confidence
  const confidence = Math.abs(deltaSeconds) < 120 ? 'high' : 
                    Math.abs(deltaSeconds) < 300 ? 'medium' : 'low';
  
  return {
    projectedTime,
    projectedPace,
    deltaFromGoal: deltaStr,
    confidence
  };
};

/**
 * Convert seconds to time string
 */
const secondsToTimeString = (seconds) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.round(seconds % 60);
  
  if (hrs > 0) {
    return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

/**
 * Convert time string to seconds
 */
const timeStringToSeconds = (timeStr) => {
  const parts = timeStr.split(':').map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return parts[0];
};

/**
 * Format delta seconds to string
 */
const formatDelta = (deltaSeconds) => {
  const sign = deltaSeconds >= 0 ? '+' : '-';
  const absDelta = Math.abs(deltaSeconds);
  const mins = Math.floor(absDelta / 60);
  const secs = Math.round(absDelta % 60);
  return `${sign}${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

module.exports = {
  createRace,
  getActiveRace,
  getRaceById,
  updateRacePrediction,
  updateRaceStatus,
  submitRaceResult,
  getUserRaces
};

