// scripts/syncStatuses.js

import mongoose from "mongoose";
import dotenv from "dotenv";
import { syncAllUserStatuses } from "../services/syncUserStatus.js"; // ✅ named import

dotenv.config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.once("open", async () => {
  console.log("🔌 Connected to MongoDB");
  await syncAllUserStatuses();
  mongoose.connection.close();
});
