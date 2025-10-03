/**
 * User Status Checker - Simple existence checks
 * Like TripWell: Check if models exist, that's it!
 */

const User = require('../models/GoFast/User');
const RunnerProfile = require('../models/GoFast/RunnerProfile');
const Race = require('../models/GoFast/Race');
const { TrainingPlan } = require('../models/GoFast/TrainingPlan');

/**
 * Get user status based on what exists
 */
const getUserStatus = async (firebaseId) => {
  // Check User exists
  const user = await User.findOne({ firebaseId });
  if (!user) {
    return { status: 'no_account', route: '/signup' };
  }

  // Check RunnerProfile exists
  const profile = await RunnerProfile.findOne({ userId: user._id });
  if (!profile) {
    return { status: 'needs_profile', route: '/runner-profile', user };
  }

  // Check Race exists
  const race = await Race.findOne({ 
    userId: user._id, 
    status: { $in: ['planning', 'training', 'taper', 'race_week'] }
  }).sort({ raceDate: 1 });
  
  if (!race) {
    return { status: 'needs_race', route: '/race-setup', user, profile };
  }

  // Check TrainingPlan exists
  const plan = await TrainingPlan.findOne({ 
    raceId: race._id, 
    status: 'active' 
  });
  
  if (!plan) {
    return { status: 'needs_plan', route: '/race-setup', user, profile, race };
  }

  // All set - training!
  return { 
    status: 'training', 
    route: '/training-pulse-hub', 
    user, 
    profile, 
    race, 
    plan 
  };
};

/**
 * Hydrate endpoint - returns all user data
 */
const hydrateUserData = async (firebaseId) => {
  const user = await User.findOne({ firebaseId });
  if (!user) return null;

  const profile = await RunnerProfile.findOne({ userId: user._id });
  const race = await Race.findOne({ 
    userId: user._id,
    status: { $in: ['planning', 'training', 'taper', 'race_week'] }
  }).sort({ raceDate: 1 });
  
  const plan = race ? await TrainingPlan.findOne({ 
    raceId: race._id,
    status: 'active'
  }) : null;

  return {
    user,
    profile,
    race,
    plan
  };
};

module.exports = {
  getUserStatus,
  hydrateUserData
};

