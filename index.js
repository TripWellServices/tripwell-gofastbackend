const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const admin = require("firebase-admin");
require("dotenv").config();

const app = express();

// === CORS CONFIG ===
const allowedOrigins = [
  "http://localhost:5173",
  "https://tripwell-frontend.vercel.app",
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
  methods: ["GET", "POST", "OPTIONS", "PUT", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "Cache-Control", "Pragma", "Expires"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// === PARSER ===
app.use(morgan("dev"));
app.use(express.json());

// === FIREBASE ADMIN INIT ===
if (!admin.apps.length) {
  let serviceAccount;
  
  // Try environment variable first (for Render)
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    console.log("✅ Using Firebase service account from environment variable");
  } else {
    // Fall back to local file (for Replit/local dev)
    try {
      serviceAccount = require("./firebaseServiceKey.json");
      console.log("✅ Using Firebase service account from local file");
    } catch (error) {
      console.error("❌ Firebase service account not found. Please ensure firebaseServiceKey.json exists or FIREBASE_SERVICE_ACCOUNT environment variable is set.");
      process.exit(1);
    }
  }
  
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

// ✅ TripWell Route Mounts — Pattern A
app.use("/tripwell/trip-setup", require("./routes/TripWell/tripSetupRoute"));
app.use("/tripwell", require("./routes/TripWell/TripBaseLoadRoute"));
app.use("/tripwell", require("./routes/TripWell/JoinCodeCheckRoute"));
app.use("/tripwell", require("./routes/TripWell/tripIntentRoutes"));
app.use("/tripwell", require("./routes/TripWell/tripCreatedRoute"));
app.use("/tripwell", require("./routes/TripWell/anchorgptRoute"));
app.use("/tripwell", require("./routes/TripWell/anchorgpttestRoute"));
app.use("/tripwell", require("./routes/TripWell/itineraryRoutes")); // ✅ ADDED - Missing itinerary build route!
app.use("/tripwell", require("./routes/TripWell/ItineraryUpdateRoute"));
app.use("/tripwell", require("./routes/TripWell/tripDayBuildPreviewRoute"));
console.log("🔧 Loading tripLiveStatusRoute...");
app.use("/tripwell", require("./routes/TripWell/tripLiveStatusRoute"));
console.log("🔧 tripLiveStatusRoute loaded");
app.use("/tripwell", require("./routes/TripWell/tripDayBlockSaveRoute"));
app.use("/tripwell", require("./routes/TripWell/TripDoAllCompleterRoute"));
app.use("/tripwell", require("./routes/TripWell/TripReflectionSaveRoutes"));
app.use("/tripwell", require("./routes/TripWell/lookbackRoute"));
app.use("/tripwell", require("./routes/TripWell/tripStartRoute"));
app.use("/tripwell", require("./routes/TripWell/tripStatusRoute"));
app.use("/tripwell", require("./routes/TripWell/validateJoinCodeRoute"));
app.use("/tripwell", require("./routes/TripWell/hydrateRoute"));
app.use("/tripwell/user", require("./routes/TripWell/TripWellUserRoute"));
app.use("/tripwell/participant", require("./routes/TripWell/participantUserCreateRoute"));

// ✅ Secure Auth-Protected Flow
app.use("/tripwell", verifyFirebaseToken, require("./routes/TripWell/whoami"));
app.use("/tripwell", verifyFirebaseToken, require("./routes/TripWell/profileSetupRoute"));
app.use("/tripwell", verifyFirebaseToken, require("./routes/TripWell/AnchorSelectSaveRoutes"));

// === ROOT CHECK ===
app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "TripWell Backend API",
    message: "🔥 Welcome to the TripWell backend. Routes are mounted under /tripwell.",
    version: "1.0.0",
  });
});

// === ERROR HANDLER ===
app.use((err, req, res, next) => {
  console.error("🔥 Unhandled error:", err);
  res.status(500).json({ ok: false, error: err.message });
});

// === SERVER START ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 TripWell backend live on port ${PORT}`);
});
