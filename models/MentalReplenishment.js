import mongoose from "mongoose";

const MentalReplenishmentSchema = new mongoose.Schema({
  userId: String,
  selectedEmoji: String,
  message: String,
  action: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("MentalReplenishment", MentalReplenishmentSchema);
