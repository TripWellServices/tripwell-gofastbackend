// scripts/syncStatuses.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { syncAllUserStatuses } = require('../services/syncUserStatus"; // ✅ named import');

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