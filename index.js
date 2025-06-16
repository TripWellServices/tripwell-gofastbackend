const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const admin = require("firebase-admin");
require("dotenv").config();

const app = express();

// === CORS CONFIG ===
const allowedOrigins = [
  "http://localhost:5173",
  "https://tripwell-frontend.vercel.app"
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn("❌ Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// === PARSER ===
app.use(express.json());

// === FIREBASE ADMIN INIT ===
if (!admin.apps.length) {
  const serviceAccount = require("./firebaseServiceKey.json");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("✅ Firebase Admin initialized");
}

// === MONGO CONNECT ===
mongoose
  .connect(process.env.MONGO_URI, {
    dbName: "GoFastFamily",
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// === MIDDLEWARE ===
const verifyFirebaseToken = require("./middleware/verifyFirebaseToken");

// === TRIPWELL CORE ROUTES (No token) ===
app.use("/trip", require("./routes/TripWell/tripRoutes"));          // Trip create/join
app.use("/trip", require("./routes/TripWell/userTripUpdate"));      // Patch trip fields
app.use("/trip", require("./routes/TripWell/profileSetup"));        // Profile/Onboarding

// === TRIPWELL GPT SECURE FLOW (Requires Firebase token) ===
app.use("/tripwell", verifyFirebaseToken, require("./routes/TripWell/whoami"));        // Auth + user/trip hydration
app.use("/tripwell", verifyFirebaseToken, require("./routes/TripWell/tripChat"));      // Save user question
app.use("/tripwell", verifyFirebaseToken, require("./routes/TripWell/tripGPT"));       // GPT reply
app.use("/tripwell", verifyFirebaseToken, require("./routes/TripWell/sceneSetter"));   // GPT scene intro
app.use("/tripwell", verifyFirebaseToken, require("./routes/TripWell/tripPlanner"));   // GPT anchor suggestions

// === ROOT CHECK ===
app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "TripWell Backend API",
    message: "🔥 Welcome to the TripWell backend. Routes are mounted under /trip and /tripwell.",
    version: "1.0.0",
  });
});

// === SERVER START ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 TripWell backend live on port ${PORT}`);
});
