
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    userStatus: {
      type: String,
      enum: [
        "registered",
        "onboarding",
        "ready_to_train",
        "training",
        "inactive",
        "race_mode",
        "race_day",
        "reviewing",
        "completed"
      ],
      default: "registered",
    },
    lastGarminLog: { type: Date },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
