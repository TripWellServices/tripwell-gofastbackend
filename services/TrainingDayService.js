const TrainingDay = require('../models/TrainingDay');
const Session = require('../models/Session');
const GarminActivity = require('../models/GarminActivity');
const CompletionFlags = require('../models/CompletionFlags');

/**
 * TrainingDayService - Handles daily workout logic and Garmin hydration
 */

/**
 * Get today's workout for user
 */
const getTodayWorkout = async (userId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const workout = await TrainingDay.findOne({
    userId,
    date: today
  }).populate('sessionId');
  
  if (!workout) {
    return { error: 'No workout scheduled for today' };
  }
  
  return {
    date: workout.date,
    status: workout.status,
    planned: workout.planned,
    actual: workout.actual,
    analysis: workout.analysis,
    feedback: workout.feedback
  };
};

/**
 * Get workout for specific date
 */
const getWorkoutByDate = async (userId, date) => {
  const workoutDate = new Date(date);
  workoutDate.setHours(0, 0, 0, 0);
  
  return await TrainingDay.findOne({
    userId,
    date: workoutDate
  }).populate('sessionId');
};

/**
 * Get all workouts for a week
 */
const getWeekWorkouts = async (userId, weekIndex) => {
  return await TrainingDay.find({
    userId,
    weekIndex
  }).sort({ dayIndex: 1 });
};

/**
 * Create training day (when plan is generated)
 */
const createTrainingDay = async (dayData) => {
  const trainingDay = await TrainingDay.create({
    userId: dayData.userId,
    raceId: dayData.raceId,
    trainingPlanId: dayData.trainingPlanId,
    date: dayData.date,
    weekIndex: dayData.weekIndex,
    dayIndex: dayData.dayIndex,
    dayName: dayData.dayName,
    phase: dayData.phase,
    planned: dayData.planned
  });
  
  return trainingDay;
};

/**
 * Hydrate Garmin data into training day
 */
const hydrateGarminData = async (userId, activityDate) => {
  // Find the training day
  const workoutDate = new Date(activityDate);
  workoutDate.setHours(0, 0, 0, 0);
  
  const trainingDay = await TrainingDay.findOne({
    userId,
    date: workoutDate
  });
  
  if (!trainingDay) {
    console.log(`⚠️ No training day found for ${activityDate}`);
    return null;
  }
  
  // Find Garmin activity
  const garminActivity = await GarminActivity.findOne({
    userId: userId.toString(),
    activityDate: activityDate
  });
  
  if (!garminActivity) {
    console.log(`⚠️ No Garmin activity found for ${activityDate}`);
    return null;
  }
  
  // Create Session record for detailed data
  const session = await Session.create({
    userId,
    trainingDayId: trainingDay._id,
    garminActivityId: garminActivity._id.toString(),
    activityDate: new Date(activityDate),
    distance: garminActivity.mileage,
    duration: garminActivity.duration,
    avgPace: garminActivity.pace,
    avgHR: garminActivity.avgHr,
    rawData: garminActivity.raw
  });
  
  // Hydrate the training day with actual data
  trainingDay.hydrateGarminData({
    mileage: garminActivity.mileage,
    duration: garminActivity.duration,
    pace: garminActivity.pace,
    avgHR: garminActivity.avgHr,
    activityDate: new Date(activityDate),
    activityId: session._id.toString()
  });
  
  trainingDay.actual.sessionId = session._id;
  await trainingDay.save();
  
  // Update completion flags
  await updateFirstWorkoutFlag(userId, trainingDay);
  
  console.log(`✅ Hydrated Garmin data for ${activityDate}`);
  return trainingDay;
};

/**
 * Submit user feedback for workout
 */
const submitWorkoutFeedback = async (trainingDayId, feedbackData) => {
  const trainingDay = await TrainingDay.findById(trainingDayId);
  if (!trainingDay) throw new Error('Training day not found');
  
  trainingDay.feedback = {
    mood: feedbackData.mood,
    effort: feedbackData.effort,
    injuryFlag: feedbackData.injuryFlag || false,
    notes: feedbackData.notes,
    submittedAt: new Date()
  };
  
  // Recalculate analysis with feedback
  trainingDay.calculateAnalysis();
  await trainingDay.save();
  
  return trainingDay;
};

/**
 * Get weekly summary
 */
const getWeeklySummary = async (userId, weekIndex) => {
  const workouts = await TrainingDay.find({
    userId,
    weekIndex
  }).sort({ dayIndex: 1 });
  
  const completed = workouts.filter(w => w.actual.completed);
  const totalPlannedMileage = workouts.reduce((sum, w) => sum + (w.planned.mileage || 0), 0);
  const totalActualMileage = completed.reduce((sum, w) => sum + (w.actual.mileage || 0), 0);
  
  const avgHR = completed.length > 0 
    ? completed.reduce((sum, w) => sum + (w.actual.avgHR || 0), 0) / completed.length
    : 0;
  
  return {
    weekIndex,
    totalWorkouts: workouts.length,
    completedWorkouts: completed.length,
    completionRate: Math.round((completed.length / workouts.length) * 100),
    totalPlannedMileage,
    totalActualMileage,
    avgHR: Math.round(avgHR),
    workouts: workouts.map(w => ({
      date: w.date,
      planned: w.planned.type,
      completed: w.actual.completed,
      status: w.status
    }))
  };
};

/**
 * Get training progress overview
 */
const getTrainingProgress = async (userId) => {
  const totalDays = await TrainingDay.countDocuments({ userId });
  const completedDays = await TrainingDay.countDocuments({ 
    userId, 
    'actual.completed': true 
  });
  
  const totalMileage = await TrainingDay.aggregate([
    { $match: { userId, 'actual.completed': true } },
    { $group: { _id: null, total: { $sum: '$actual.mileage' } } }
  ]);
  
  return {
    totalDays,
    completedDays,
    completionRate: totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0,
    totalMileage: totalMileage[0]?.total || 0
  };
};

/**
 * Batch create training days for a plan
 */
const batchCreateTrainingDays = async (planData) => {
  const trainingDays = [];
  
  for (const dayData of planData.days) {
    const trainingDay = await createTrainingDay(dayData);
    trainingDays.push(trainingDay);
  }
  
  return trainingDays;
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Update first workout completion flag
 */
const updateFirstWorkoutFlag = async (userId, trainingDay) => {
  const flags = await CompletionFlags.findOne({ userId });
  if (!flags) return;
  
  // Check if this is first workout
  if (!flags.training.firstWorkoutComplete && trainingDay.actual.completed) {
    flags.plantFlag('training', 'firstWorkoutComplete');
    await flags.save();
  }
  
  // Check for milestone workouts
  if (trainingDay.planned.type === 'long_run' && !flags.training.firstLongRunComplete) {
    flags.training.firstLongRunComplete = true;
    await flags.save();
  }
  
  if (trainingDay.planned.type === 'tempo' && !flags.training.firstTempoComplete) {
    flags.training.firstTempoComplete = true;
    await flags.save();
  }
  
  if (trainingDay.planned.type === 'intervals' && !flags.training.firstIntervalsComplete) {
    flags.training.firstIntervalsComplete = true;
    await flags.save();
  }
};

module.exports = {
  getTodayWorkout,
  getWorkoutByDate,
  getWeekWorkouts,
  createTrainingDay,
  hydrateGarminData,
  submitWorkoutFeedback,
  getWeeklySummary,
  getTrainingProgress,
  batchCreateTrainingDays
};

