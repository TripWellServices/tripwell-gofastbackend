/**
 * Migration Script: Migrate existing data to normalized models
 * 
 * This script migrates data from:
 * - TrainingBase + GoalProfile → Race
 * - TrainingPlan (old) → TrainingPlan (new) + TrainingDay
 * - GarminActivity → Session (with TrainingDay linking)
 * 
 * Usage: node scripts/migrateToNormalizedModels.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Old models
const TrainingBase = require('../models/TrainingBase');
const GoalProfile = require('../models/GoalProfile');
const { TrainingPlan: OldTrainingPlan } = require('../models/TrainingPlan');
const GarminActivity = require('../models/GarminActivity');

// New models
const Race = require('../models/Race');
const TrainingDay = require('../models/TrainingDay');
const Session = require('../models/Session');
const CompletionFlags = require('../models/CompletionFlags');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "GoFastFamily",
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected to GoFastFamily...");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

/**
 * Migrate TrainingBase + GoalProfile → Race
 */
const migrateToRace = async () => {
  console.log('\n📦 Step 1: Migrating TrainingBase + GoalProfile to Race...');
  
  const trainingBases = await TrainingBase.find({});
  let migrated = 0;
  let skipped = 0;
  
  for (const base of trainingBases) {
    try {
      // Check if race already exists
      const existingRace = await Race.findOne({ 
        userId: base.userId,
        raceType: base.raceGoal?.type 
      });
      
      if (existingRace) {
        console.log(`  ⏭️  Race already exists for user ${base.userId}`);
        skipped++;
        continue;
      }
      
      // Get goal profile if exists
      const goalProfile = await GoalProfile.findOne({ userId: base.userId });
      
      // Calculate distance
      const distanceMap = {
        '5k': 3.1,
        '10k': 6.2,
        '10m': 10,
        'half': 13.1,
        'marathon': 26.2
      };
      
      const raceType = base.raceGoal?.type || 'half';
      const distanceMiles = distanceMap[raceType] || 13.1;
      
      // Create Race
      await Race.create({
        userId: base.userId,
        raceName: base.raceGoal?.name || 'My Race',
        raceType: raceType,
        raceDate: base.raceGoal?.date || new Date(),
        goalTime: base.raceGoal?.goalTime || '2:00:00',
        baseline5k: base.currentFitness?.current5kTime || '25:00',
        baselineWeeklyMileage: base.currentFitness?.weeklyMileage || 20,
        distanceMiles,
        status: 'planning'
      });
      
      migrated++;
      console.log(`  ✅ Migrated race for user ${base.userId}`);
    } catch (error) {
      console.error(`  ❌ Error migrating for user ${base.userId}:`, error.message);
    }
  }
  
  console.log(`\n📊 Race Migration Complete: ${migrated} migrated, ${skipped} skipped`);
};

/**
 * Migrate old TrainingPlan to new structure with TrainingDays
 */
const migrateTrainingPlans = async () => {
  console.log('\n📦 Step 2: Migrating TrainingPlans to new structure...');
  
  const oldPlans = await OldTrainingPlan.find({});
  let migrated = 0;
  let skipped = 0;
  
  for (const oldPlan of oldPlans) {
    try {
      // Find corresponding race
      const race = await Race.findOne({ userId: oldPlan.userId });
      
      if (!race) {
        console.log(`  ⚠️  No race found for user ${oldPlan.userId}, skipping...`);
        skipped++;
        continue;
      }
      
      // Check if new plan already exists
      const existingPlan = await OldTrainingPlan.findOne({ 
        userId: oldPlan.userId,
        raceId: race._id 
      });
      
      if (existingPlan) {
        console.log(`  ⏭️  Plan already migrated for user ${oldPlan.userId}`);
        skipped++;
        continue;
      }
      
      // Migrate plan data
      const newPlan = await OldTrainingPlan.create({
        userId: oldPlan.userId,
        raceId: race._id,
        startDate: new Date(oldPlan.startDate),
        raceDate: new Date(oldPlan.raceDate),
        totalWeeks: oldPlan.totalWeeks || 12,
        phaseOverview: oldPlan.phaseOverview || {},
        weeklyMileagePlan: oldPlan.weeklyMileagePlan || [],
        weeks: [],
        status: 'active',
        _legacy: {
          raceGoal: oldPlan.raceGoal,
          currentFitness: oldPlan.currentFitness
        }
      });
      
      // Migrate weeks and create TrainingDay documents
      if (oldPlan.weeks && Array.isArray(oldPlan.weeks)) {
        for (let weekIndex = 0; weekIndex < oldPlan.weeks.length; weekIndex++) {
          const week = oldPlan.weeks[weekIndex];
          
          if (week.days && Array.isArray(week.days)) {
            const dayIds = [];
            
            for (let dayIndex = 0; dayIndex < week.days.length; dayIndex++) {
              const day = week.days[dayIndex];
              
              const dayDate = new Date(oldPlan.startDate);
              dayDate.setDate(dayDate.getDate() + (weekIndex * 7) + dayIndex);
              
              // Create TrainingDay
              const trainingDay = await TrainingDay.create({
                userId: oldPlan.userId,
                raceId: race._id,
                trainingPlanId: newPlan._id,
                date: dayDate,
                weekIndex,
                dayIndex,
                dayName: day.day || 'Monday',
                phase: week.phase || 'build',
                planned: {
                  type: day.type || 'easy',
                  mileage: day.mileage || 0,
                  paceRange: day.paceRange || '',
                  hrZone: day.zone || 2,
                  hrRange: day.hrRange || '',
                  segments: day.segments || [],
                  label: day.label || ''
                }
              });
              
              dayIds.push(trainingDay._id);
            }
            
            // Update plan with week summary
            newPlan.weeks.push({
              weekIndex,
              startDate: new Date(new Date(oldPlan.startDate).setDate(new Date(oldPlan.startDate).getDate() + (weekIndex * 7))),
              endDate: new Date(new Date(oldPlan.startDate).setDate(new Date(oldPlan.startDate).getDate() + (weekIndex * 7) + 6)),
              phase: week.phase || 'build',
              targetMileage: week.targetMileage || 20,
              dayIds
            });
          }
        }
        
        await newPlan.save();
      }
      
      migrated++;
      console.log(`  ✅ Migrated training plan for user ${oldPlan.userId}`);
    } catch (error) {
      console.error(`  ❌ Error migrating plan for user ${oldPlan.userId}:`, error.message);
    }
  }
  
  console.log(`\n📊 TrainingPlan Migration Complete: ${migrated} migrated, ${skipped} skipped`);
};

/**
 * Migrate GarminActivity to Session
 */
const migrateGarminToSession = async () => {
  console.log('\n📦 Step 3: Migrating GarminActivity to Session...');
  
  const garminActivities = await GarminActivity.find({});
  let migrated = 0;
  let skipped = 0;
  
  for (const activity of garminActivities) {
    try {
      // Check if session already exists
      const existingSession = await Session.findOne({ 
        garminActivityId: activity._id.toString()
      });
      
      if (existingSession) {
        skipped++;
        continue;
      }
      
      // Find matching training day
      const activityDate = new Date(activity.activityDate);
      activityDate.setHours(0, 0, 0, 0);
      
      const trainingDay = await TrainingDay.findOne({
        userId: activity.userId,
        date: activityDate
      });
      
      // Create Session
      await Session.create({
        userId: activity.userId,
        trainingDayId: trainingDay?._id || null,
        garminActivityId: activity._id.toString(),
        activityDate: new Date(activity.activityDate),
        distance: activity.mileage,
        duration: activity.duration,
        avgPace: activity.pace,
        avgHR: activity.avgHr,
        rawData: activity.raw
      });
      
      migrated++;
      
      if (migrated % 50 === 0) {
        console.log(`  📍 Migrated ${migrated} sessions...`);
      }
    } catch (error) {
      console.error(`  ❌ Error migrating activity ${activity._id}:`, error.message);
    }
  }
  
  console.log(`\n📊 Session Migration Complete: ${migrated} migrated, ${skipped} skipped`);
};

/**
 * Create CompletionFlags for existing users
 */
const createCompletionFlags = async () => {
  console.log('\n📦 Step 4: Creating CompletionFlags for existing users...');
  
  const User = require('../models/User');
  const users = await User.find({});
  let created = 0;
  
  for (const user of users) {
    try {
      const existingFlags = await CompletionFlags.findOne({ userId: user._id });
      
      if (existingFlags) continue;
      
      // Create flags with smart defaults based on existing data
      const race = await Race.findOne({ userId: user._id });
      const plan = await OldTrainingPlan.findOne({ userId: user._id, status: 'active' });
      
      const flags = await CompletionFlags.create({
        userId: user._id,
        raceId: race?._id || null,
        onboarding: {
          accountCreated: true,
          accountCreatedAt: user.createdAt,
          baselineSet: !!race?.baseline5k,
          goalSet: !!race,
          planGenerated: !!plan,
          planAccepted: plan?.status === 'active'
        },
        training: {
          trainingStarted: plan?.status === 'active'
        }
      });
      
      created++;
    } catch (error) {
      console.error(`  ❌ Error creating flags for user ${user._id}:`, error.message);
    }
  }
  
  console.log(`\n📊 CompletionFlags Creation Complete: ${created} created`);
};

/**
 * Main migration runner
 */
const runMigration = async () => {
  console.log('\n🚀 Starting Migration to Normalized Models...\n');
  
  await connectDB();
  
  await migrateToRace();
  await migrateTrainingPlans();
  await migrateGarminToSession();
  await createCompletionFlags();
  
  console.log('\n✅ Migration Complete!\n');
  process.exit(0);
};

// Run migration
runMigration().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});

