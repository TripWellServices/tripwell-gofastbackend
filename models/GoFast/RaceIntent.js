const mongoose = require("mongoose");

/**
 * RaceIntent Model - Like TripWell's TripIntent
 * Stores user's race goals before GPT generates the plan
 */
const raceIntentSchema = new mongoose.Schema({
  // 🔗 References
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  
  runnerProfileId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'RunnerProfile', 
    required: true 
  },

  // 🏃‍♂️ Race Details
  raceName: { 
    type: String, 
    required: true,
    trim: true
  },
  
  raceType: { 
    type: String, 
    required: true,
    enum: ['5K', '10K', 'Half Marathon', 'Marathon', 'Ultra'],
    index: true
  },
  
  raceDate: { 
    type: Date, 
    required: true,
    index: true
  },
  
  goalTime: { 
    type: String, 
    required: true // Format: "25:30" for 5K, "1:45:00" for half
  },
  
  location: { 
    type: String, 
    trim: true 
  },

  // 🎯 Training Intent
  currentWeeklyMileage: { 
    type: Number, 
    required: true 
  },
  
  baseline5k: { 
    type: String, 
    required: true // Current 5K time
  },
  
  trainingDaysPerWeek: { 
    type: Number, 
    default: 4,
    min: 3,
    max: 7
  },
  
  preferredLongRunDay: { 
    type: String, 
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    default: 'Saturday'
  },

  // 🤖 GPT Processing
  gptPrompt: { 
    type: String 
  },
  
  gptResponse: { 
    type: String 
  },
  
  gptProcessingStatus: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  
  gptError: { 
    type: String 
  },

  // 📊 Generated Plan Reference
  trainingPlanId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'TrainingPlan' 
  },

  // 🏁 Status
  status: { 
    type: String, 
    enum: ['draft', 'submitted', 'plan_generated', 'active', 'completed'],
    default: 'draft',
    index: true
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Indexes for performance
raceIntentSchema.index({ userId: 1, status: 1 });
raceIntentSchema.index({ raceDate: 1, status: 1 });

module.exports = mongoose.model("RaceIntent", raceIntentSchema);
