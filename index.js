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
const userRoutes = require('./routes/userRoutes');
const workoutRoutes = require('./routes/workoutRoutes');
const firebaseAuthRoutes = require("./routes/auth/firebaseAuthRoutes");
app.use("/api/auth", firebaseAuthRoutes);
const tripwellProfileRoutes = require("./routes/TripWell/profileSetup");
app.use("/tripwell", tripwellProfileRoutes);
