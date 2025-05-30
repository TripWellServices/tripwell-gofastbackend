const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// === CORS CONFIG ===
const allowedOrigins = [
  "http://localhost:5173",                             // Local Dev (Vite)
  "https://tripwell-frontend.vercel.app",              // TripWell prod
  "https://gofast-frontend.vercel.app",                // GoFast prod
  "https://gofast-frontend-ochre.vercel.app"           // GoFast alt
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

// === 🔐 GARMIN TOKEN PLACEHOLDER ===
app.locals.oauthTokenSecrets = {};

// === DB CONNECTION ===
mongoose.connect(process.env.MONGO_URI, {
  dbName: "GoFastFamily",  // ✅ ← THIS IS THE KEY LINE
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected to GoFastFamily"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// === ROUTE FILES ===
const firebaseAuthRoutes = require("./routes/auth/firebaseAuthRoutes");
const tripwellProfileRoutes = require("./routes/TripWell/profileSetup");
const trainingBaseRoutes = require('./routes/trainingbase');
const workoutRoutes = require('./routes/workoutRoutes');
const userRoutes = require("./routes/userRoutes");
const userTripUpdateRoutes = require("./routes/TripWell/userTripUpdate");
const tripRoutes = require('./routes/TripWell/tripRoutes');
const tripChatRoutes = require("./routes/TripWell/tripChat");

// === ROUTE MOUNT POINTS ===
app.use("/api/auth", firebaseAuthRoutes);               
app.use("/api/users", require("./routes/TripWell/profileSetup"));
app.use("/api/users", userRoutes);                         
app.use("/api/training", trainingBaseRoutes);              
app.use("/api/workouts", workoutRoutes);                   
app.use("/api/usertrip", userTripUpdateRoutes);            
app.use("/api", tripRoutes);                               
app.use("/trip", tripChatRoutes);                          

// === DEFAULT ROOT ===
app.get("/", (req, res) => {
  res.send("🔥 GoFast/TripWell backend is live.");
});

// === BOOT UP ===
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
