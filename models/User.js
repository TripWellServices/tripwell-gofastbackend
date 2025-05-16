const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  userStatus: {
    type: String,
    enum: [
      'not_registered',
      'not_started',
      'onboarding',
      'plan_generated',
      'pending_start',
      'training_active',
      'training_inactive',
      'pre_race',
      'race_day',
      'post_race'
    ],
    default: 'not_started',
  },
});

module.exports = mongoose.model("User", userSchema);
