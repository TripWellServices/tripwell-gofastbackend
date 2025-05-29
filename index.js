const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// === CORS CONFIG ===
const allowedOrigins = [
  "http://localhost:5173",
  "https://tripwell-frontend.vercel.app",
  "https://gofast-frontend.vercel.app" // Add your second frontend domain here
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

// === MIDDLEWARE ===
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// === 🔐 TEMP GARMIN TOKEN STORE ===
app.locals.oauthTokenSecrets = {}; // ✅ Shared secrets between initiate.js & callback.js

// === DB CONNECTION ===
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/gofast', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// === ROUTES ===
const firebaseAuthRoutes = require("./routes/auth/firebaseAuthRoutes");
const tripwellProfileRoutes = require("./routes/TripWell/profileSetup");
const trainingBaseRoutes = require('./routes/trainingbase');
const workoutRoutes = require('./routes/workoutRoutes');
const userRoutes = require("./routes/userRoutes");
const userTripUpdateRoutes = require("./routes/TripWell/userTripUpdate");
const tripRoutes = require('./routes/TripWell/tripRoutes');
const tripChatRoutes = require("./routes/TripWell/tripChat");

app.use("/api/auth", firebaseAuthRoutes);               // 🔐 Firebase login
app.use("/tripwell", tripwellProfileRoutes);            // 🌴 TripWell profile setup
app.use("/api/users", userRoutes);                      // 👤 User profile
app.use("/api/training", trainingBaseRoutes);           // 🏃 GoFast plan base
app.use("/api/workouts", workoutRoutes);                // 🏋️ Workout logging
app.use("/api/usertrip", userTripUpdateRoutes);         // 🧳 TripWell progress
app.use("/api", tripRoutes);                            // ✈️ Trip planning
app.use("/trip", tripChatRoutes);                       // 💬 Trip notes + chat

// === DEFAULT ROUTE ===
app.get("/", (req, res) => {
  res.send("🔥 GoFast backend is live. Use the defined API routes.");
});

// === SERVER START ===
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
