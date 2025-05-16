import mongoose from "mongoose";

const PulsePerformanceSchema = new mongoose.Schema({
  userId: String,
  completedRuns: { type: Map, of: Boolean },  // which days they ran (future use)
  totalMileage: String,                       // weekly total
  longRunHR: String,                          // average HR from long run
  hitGoalPace: String,                        // "yes" or "no"
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("PulsePerformance", PulsePerformanceSchema);
