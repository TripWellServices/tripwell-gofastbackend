const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// === MIDDLEWARE ===
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// === 🔐 TEMP GARMIN TOKEN STORE ===
app.locals.oauthTokenSecrets = {}; // ✅ Ensures initiate.js & callback.js share temp secrets

// === DB CONNECTION ===
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/gofast', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// === PASSPORT CONFIG ===
require('./routes/auth/googleAuth'); // sets up Google OAuth strategy

// === ROUTES ===
const trainingBaseRoutes = require('./routes/trainingbase');
const workoutRoutes = require('./routes/workoutRoutes');
const firebaseAuthRoutes = require("./routes/auth/firebaseAuthRoutes");
const tripwellProfileRoutes = require("./routes/TripWell/profileSetup");
const userRoutes = require("./routes/userRoutes");

app.use("/api/auth", firebaseAuthRoutes);               // 🔐 Firebase login
app.use("/tripwell", tripwellProfileRoutes);            // 🌴 TripWell profile setup
app.use("/api/users", userRoutes);                      // 🔐 User profile routes
app.use("/api/training", trainingBaseRoutes);           // 🏃 GoFast core
app.use("/api/workouts", workoutRoutes);                // 🏋️ Workout logs
const userTripUpdateRoutes = require("./routes/TripWell/userTripUpdate");
app.use("/api/usertrip", userTripUpdateRoutes);

const tripRoutes = require('./routes/TripWell/tripRoutes');
app.use('/api', tripRoutes);
app.get("/", (req, res) => {
  res.send("✅ GoFast + TripWell backend is alive.");
});