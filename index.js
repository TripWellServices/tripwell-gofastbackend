const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const admin = require("firebase-admin");
require("dotenv").config();

const app = express();

// === Middleware ===
app.use(cors());
app.use(express.json());

// === Firebase Admin Init ===
if (!admin.apps.length) {
  const serviceAccount = require("./firebaseServiceKey.json");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// === MongoDB Connection ===
mongoose
  .connect(process.env.MONGO_URI, {
    dbName: "GoFastFamily",
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// === ROUTES ===
app.use("/trip", require("./routes/TripWell/tripRoutes"));        // trip creation, join, etc
app.use("/trip", require("./routes/TripWell/tripChat"));          // GPT chat
app.use("/trip", require("./routes/TripWell/userTripUpdate"));    // trip patching
app.use("/trip", require("./routes/TripWell/profileSetup"));      // profile setup
app.use("/tripwell", require("./routes/TripWell/whoami"));        // trip hydration

// === ROOT ROUTE ===
app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "TripWell Backend API",
    message: "🔥 Welcome to the TripWell backend. Routes are mounted under /trip and /tripwell.",
    version: "1.0.0",
  });
});

// === Server Start ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server live on port ${PORT}`);
});
