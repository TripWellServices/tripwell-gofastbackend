const { TrainingPlan } = require('../models/TrainingPlan');
const Race = require('../models/Race');
const TrainingDay = require('../models/TrainingDay');
const CompletionFlags = require('../models/CompletionFlags');
const { getPhaseMap } = require('../utils/phaseUtils');
const { buildDailyWorkout } = require('./DailyWorkoutBuilderService');
const { getLongRunMileage } = require('../utils/LongRunUtils');
const { splitMileageAcrossDays } = require('../utils/DailyMileageUtils');

/**
 * TrainingPlanGeneratorService - Generates complete training plans with Race & TrainingDay integration
 */

/**
 * Generate complete training plan for a race
 */
const generateTrainingPlan = async (raceId, userAge = 30) => {
  // Get race details
  const race = await Race.findById(raceId);
  if (!race) throw new Error('Race not found');
  
  const userId = race.userId;
  const startDate = new Date();
  const raceDate = new Date(race.raceDate);
  
  // Calculate total weeks
  const totalWeeks = Math.ceil((raceDate - startDate) / (1000 * 60 * 60 * 24 * 7));
  
  if (totalWeeks < 4) {
    throw new Error('Not enough time to generate a proper training plan (minimum 4 weeks required)');
  }
  
  // Get phase breakdown
  const phaseMap = getPhaseMap(totalWeeks);
  const phaseOverview = buildPhaseOverview(phaseMap);
  
  // Calculate weekly mileage progression
  const weeklyMileagePlan = calculateMileageProgression(
    totalWeeks,
    race.baselineWeeklyMileage || 20,
    phaseMap
  );
  
  // Create training plan document
  const plan = await TrainingPlan.create({
    userId,
    raceId,
    startDate,
    raceDate,
    totalWeeks,
    phaseOverview,
    weeklyMileagePlan,
    weeks: [],
    status: 'draft',
    _legacy: {
      raceGoal: {
        name: race.raceName,
        type: race.raceType,
        date: race.raceDate.toISOString(),
        goalTime: race.goalTime
      },
      currentFitness: {
        current5kTime: race.baseline5k,
        weeklyMileage: race.baselineWeeklyMileage
      }
    }
  });
  
  // Generate all training days
  const allDays = [];
  const weeks = [];
  
  for (let weekIndex = 0; weekIndex < totalWeeks; weekIndex++) {
    const weekData = await generateWeek({
      weekIndex,
      totalWeeks,
      phaseMap,
      weeklyMileagePlan,
      race,
      plan,
      userId,
      userAge,
      startDate
    });
    
    weeks.push(weekData.weekSummary);
    allDays.push(...weekData.days);
  }
  
  // Update plan with week summaries
  plan.weeks = weeks;
  await plan.save();
  
  // Update race with training plan reference
  race.trainingPlanId = plan._id;
  race.status = 'training';
  await race.save();
  
  // Update completion flags
  await updatePlanGenerationFlags(userId);
  
  console.log(`✅ Generated training plan: ${totalWeeks} weeks, ${allDays.length} days`);
  
  return {
    plan,
    totalDays: allDays.length,
    totalWeeks
  };
};

/**
 * Generate a single week of training
 */
const generateWeek = async ({
  weekIndex,
  totalWeeks,
  phaseMap,
  weeklyMileagePlan,
  race,
  plan,
  userId,
  userAge,
  startDate
}) => {
  const phase = getPhaseForWeek(weekIndex, phaseMap);
  const weekMileage = weeklyMileagePlan[weekIndex].targetMileage;
  
  // Calculate week dates
  const weekStartDate = new Date(startDate);
  weekStartDate.setDate(weekStartDate.getDate() + (weekIndex * 7));
  
  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekEndDate.getDate() + 6);
  
  // Calculate daily mileage distribution
  const longRun = getLongRunMileage(weekMileage);
  const dailyMileageMap = splitMileageAcrossDays(weekMileage, longRun);
  
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const days = [];
  const dayIds = [];
  
  for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
    const dayName = daysOfWeek[dayIndex];
    const dayDate = new Date(weekStartDate);
    dayDate.setDate(dayDate.getDate() + dayIndex);
    
    // Build daily workout plan
    const plannedWorkout = buildDailyWorkout({
      day: dayName,
      phase,
      weekIndex,
      mileage: dailyMileageMap[dayName],
      current5kPace: race.baseline5k,
      age: userAge
    });
    
    // Create TrainingDay document
    const trainingDay = await TrainingDay.create({
      userId,
      raceId: race._id,
      trainingPlanId: plan._id,
      date: dayDate,
      weekIndex,
      dayIndex,
      dayName,
      phase,
      planned: {
        type: plannedWorkout.type,
        mileage: plannedWorkout.mileage,
        paceRange: plannedWorkout.paceRange,
        hrZone: plannedWorkout.zone,
        hrRange: plannedWorkout.hrRange,
        segments: plannedWorkout.segments || [],
        label: plannedWorkout.label,
        description: plannedWorkout.description || ''
      }
    });
    
    days.push(trainingDay);
    dayIds.push(trainingDay._id);
  }
  
  // Build week summary
  const workoutTypes = days.map(d => d.planned.type);
  const keyWorkouts = days
    .filter(d => ['tempo', 'intervals', 'long_run', 'race_pace'].includes(d.planned.type))
    .map(d => `${d.planned.label}: ${d.planned.mileage}mi`);
  
  const weekSummary = {
    weekIndex,
    startDate: weekStartDate,
    endDate: weekEndDate,
    phase,
    targetMileage: weekMileage,
    dayIds,
    workoutTypes,
    keyWorkouts
  };
  
  return {
    weekSummary,
    days
  };
};

/**
 * Activate a training plan (move from draft to active)
 */
const activateTrainingPlan = async (planId) => {
  const plan = await TrainingPlan.findByIdAndUpdate(
    planId,
    { status: 'active' },
    { new: true }
  );
  
  if (!plan) throw new Error('Training plan not found');
  
  // Update race status
  await Race.findByIdAndUpdate(plan.raceId, { status: 'training' });
  
  // Update completion flags
  const flags = await CompletionFlags.findOne({ userId: plan.userId });
  if (flags) {
    flags.plantFlag('onboarding', 'planAccepted');
    flags.plantFlag('training', 'trainingStarted');
    await flags.save();
  }
  
  return plan;
};

/**
 * Get training plan for a race
 */
const getTrainingPlan = async (raceId) => {
  const plan = await TrainingPlan.findOne({ raceId })
    .populate('raceId')
    .populate({
      path: 'weeks.dayIds',
      model: 'TrainingDay'
    });
  
  return plan;
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Build phase overview object
 */
const buildPhaseOverview = (phaseMap) => {
  const overview = {};
  
  phaseMap.forEach(phase => {
    const phaseName = phase.name.toLowerCase();
    overview[phaseName] = {
      weeks: phase.weeks.length,
      startWeek: phase.weeks[0],
      endWeek: phase.weeks[phase.weeks.length - 1]
    };
  });
  
  return overview;
};

/**
 * Get phase for a specific week
 */
const getPhaseForWeek = (weekIndex, phaseMap) => {
  const week = weekIndex + 1;
  const phase = phaseMap.find(p => p.weeks.includes(week));
  return phase ? phase.name.toLowerCase() : 'build';
};

/**
 * Calculate weekly mileage progression
 */
const calculateMileageProgression = (totalWeeks, baseMileage, phaseMap) => {
  const progression = [];
  
  for (let weekIndex = 0; weekIndex < totalWeeks; weekIndex++) {
    const phase = getPhaseForWeek(weekIndex, phaseMap);
    let mileage;
    
    if (phase === 'build') {
      // Gradual increase during build phase
      const buildWeeks = phaseMap.find(p => p.name === 'Build').weeks.length;
      const weekInPhase = weekIndex;
      mileage = Math.round(baseMileage + (weekInPhase * 2));
    } else if (phase === 'peak') {
      // Peak mileage during peak phase
      mileage = Math.round(baseMileage * 1.5);
    } else if (phase === 'taper') {
      // Reduce mileage during taper
      const taperWeeks = phaseMap.find(p => p.name === 'Taper').weeks.length;
      const weekInTaper = weekIndex - (totalWeeks - taperWeeks);
      const reduction = 0.3 * weekInTaper;  // 30% reduction per taper week
      mileage = Math.round(baseMileage * (1 - reduction));
    } else {
      mileage = baseMileage;
    }
    
    progression.push({
      weekIndex,
      targetMileage: Math.max(mileage, 10),  // Minimum 10 miles/week
      phase
    });
  }
  
  return progression;
};

/**
 * Update completion flags for plan generation
 */
const updatePlanGenerationFlags = async (userId) => {
  let flags = await CompletionFlags.findOne({ userId });
  
  if (!flags) {
    flags = await CompletionFlags.create({ userId });
  }
  
  flags.plantFlag('onboarding', 'planGenerated');
  await flags.save();
};

module.exports = {
  generateTrainingPlan,
  activateTrainingPlan,
  getTrainingPlan,
  generateWeek
};

