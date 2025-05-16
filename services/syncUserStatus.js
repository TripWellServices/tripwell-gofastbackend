// services/syncUserStatus.js

import User from "../models/User.js";
import TrainingPlan from "../models/TrainingPlan.js";
import { determineTrainingStatus } from "../utils/statusUtils.js";

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
