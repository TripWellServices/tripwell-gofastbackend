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
  "https://tripwell-admin.vercel.app",
  "https://tripwell-tripbuild.vercel.app",
  "https://tripwell.app",
  // Allow Vercel preview URLs
  /^https:\/\/tripwell-admin-.*\.vercel\.app$/,
  /^https:\/\/tripwell-frontend-.*\.vercel\.app$/,
  /^https:\/\/tripwell-tripbuild-.*\.vercel\.app$/,
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }
    
    // Check exact matches
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    
    // Check regex patterns
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn("❌ Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "OPTIONS", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "Cache-Control", "Pragma", "Expires", "username", "password"],
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
  .then(() => console.log("✅ MongoDB connected to GoFastFamily"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// === MIDDLEWARE ===
const verifyFirebaseToken = require("./middleware/verifyFirebaseToken");

// ✅ TripWell Route Mounts — Pattern A
app.use("/tripwell/trip-setup", require("./routes/TripWell/tripSetupRoute"));
app.use("/tripwell", require("./routes/TripWell/TripBaseLoadRoute"));
app.use("/tripwell", require("./routes/TripWell/JoinCodeCheckRoute"));
app.use("/tripwell", require("./routes/TripWell/tripPersonaRoute"));
app.use("/tripwell", require("./routes/TripWell/tripCreatedRoute"));
app.use("/tripwell", require("./routes/TripWell/anchorgptRoute"));
app.use("/tripwell", require("./routes/TripWell/anchorgpttestRoute"));
app.use("/tripwell", require("./routes/TripWell/placetodoGPTRoute"));
app.use("/tripwell", require("./routes/TripWell/metaAttractionsRoute"));
app.use("/tripwell", require("./routes/TripWell/metaCreatorRoute"));
app.use("/tripwell", require("./routes/TripWell/metaParseAndSaveRoute"));
app.use("/tripwell", require("./routes/TripWell/userSelectionsRoute"));
app.use("/tripwell", require("./routes/TripWell/personaSamplesRoute"));
app.use("/tripwell", require("./routes/TripWell/contentLibraryRoute"));
app.use("/tripwell", require("./routes/TripWell/metaPlaceRoute"));
app.use("/tripwell", require("./routes/TripWell/placeProfileSaveRoute"));
app.use("/tripwell", require("./routes/TripWell/placeLibraryRoute"));
app.use("/tripwell", require("./routes/TripWell/profileDetailRoute"));
app.use("/tripwell", require("./routes/TripWell/itineraryRoutes")); // ✅ ADDED - Missing itinerary build route!
app.use("/tripwell", require("./routes/TripWell/ItineraryUpdateRoute"));
app.use("/tripwell", require("./routes/TripWell/tripDayBuildPreviewRoute"));
console.log("🔧 Loading tripLiveStatusRoute...");
app.use("/tripwell", require("./routes/TripWell/tripLiveStatusRoute"));
console.log("🔧 tripLiveStatusRoute loaded");
app.use("/tripwell", require("./routes/TripWell/tripDayBlockSaveRoute"));
app.use("/tripwell", require("./routes/TripWell/TripDoAllCompleterRoute"));
app.use("/tripwell", require("./routes/TripWell/TripReflectionSaveRoutes"));
app.use("/tripwell", require("./routes/TripWell/TripReflectionLoadRoutes"));
app.use("/tripwell", require("./routes/TripWell/lookbackRoute"));
app.use("/tripwell", require("./routes/TripWell/askAngelaLiveRoute"));
app.use("/tripwell", require("./routes/TripWell/livedayGPTModifyBlockRoute"));
app.use("/tripwell", require("./routes/TripWell/tripStartRoute"));
app.use("/tripwell", require("./routes/TripWell/validateJoinCodeRoute"));
app.use("/tripwell", require("./routes/TripWell/hydrateRoute"));
app.use("/tripwell/user", require("./routes/TripWell/FirebaseAuthRoute"));
console.log("🔧 Loading userTripUpdate route...");
app.use("/tripwell/usertrip", require("./routes/TripWell/userTripUpdate"));
console.log("✅ userTripUpdate route loaded at /tripwell/usertrip");
app.use("/tripwell/email-test", require("./routes/TripWell/emailTestRoute"));

// === DEMO FUNNEL ROUTES ===
app.use("/tripwell/demo", require("./routes/TripWell/ItineraryDemoRoute"));
app.use("/tripwell/demo", require("./routes/TripWell/demoBestThingsRoute"));
app.use("/tripwell/demo", require("./routes/TripWell/vacationLocationPlannerRoute"));

// === ADMIN ROUTES ===
app.use("/tripwell/admin", require("./routes/TripWell/adminLoginRoute"));
app.use("/tripwell/admin", require("./routes/TripWell/adminUserFetchRoute"));
app.use("/tripwell/admin", require("./routes/TripWell/adminUserModifyRoute")); // 🚧 FUTURE: User modification breadcrumb
app.use("/tripwell/admin", require("./routes/TripWell/adminUserDeleteRoute")); // ✅ NEW: Modular cascade deletion
app.use("/tripwell/admin", require("./routes/TripWell/adminTripModifyRoute"));
app.use("/tripwell/admin", require("./routes/TripWell/adminAnalyticsRoute"));
app.use("/tripwell", require("./routes/TripWell/adminUserAnalyzeRoute"));
console.log("✅ Admin routes loaded");
app.use("/tripwell/participant", require("./routes/TripWell/participantUserCreateRoute"));

// ✅ Secure Auth-Protected Flow
app.use("/tripwell", verifyFirebaseToken, require("./routes/TripWell/whoami"));
app.use("/tripwell", verifyFirebaseToken, require("./routes/TripWell/profileSetupRoute"));

// Profile Generation Routes
app.use("/tripwell", require("./routes/TripWell/profileGPTRoute"));
app.use("/tripwell", require("./routes/TripWell/profileParserRoute"));
app.use("/tripwell", require("./routes/TripWell/profileSaveRoute"));

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
