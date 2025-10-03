// services/syncUserStatus.js

const User = require('../../models/GoFast/User');
const TrainingPlan = require('../../models/GoFast/TrainingPlan');
const { determineTrainingStatus } = require('../utils/statusUtils');

export async function syncAllUserStatuses() {
  const users = await User.find({});

  for (const user of users) {
    const trainingPlan = await TrainingPlan.findOne({ userId: user._id });

    const { trainingStatus } = determineTrainingStatus(user, trainingPlan);

    user.userStatus = trainingStatus;
    await user.save();

    console.log(`✅ Updated ${user.email} to status: ${trainingStatus}`);
  }

  console.log("🎉 All user statuses synced.");
}