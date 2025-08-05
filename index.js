const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
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
  methods: ["GET", "POST", "OPTIONS","PUT"],
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

// ✅ TripWell Route Mounts (Unprotected)
app.use("/tripwell/intent", require("./routes/TripWell/tripIntentRoutes"));
app.use("/tripwell/tripCreated", require("./routes/TripWell/tripCreatedRoute"));
app.use(
  "/tripwell/saveanchors",
  require("./routes/TripWell/AnchorSelectSaveRoutes"),
);

app.use(
  "/tripwell/modifydays",
  require("./routes/TripWell/ItineraryUpdateRoute"),
);
app.use(
  "/tripwell/buildpreview",
  require("./routes/TripWell/tripDayBuildPreviewRoute"),
);

app.use(
  "/tripwell/livestatus",
  require("./routes/TripWell/tripLiveStatusRoute"),
);
app.use(
  "/tripwell/block/save",
  require("./routes/TripWell/tripDayBlockSaveRoute"),
);
app.use(
  "/tripwell/block/complete",
  require("./routes/TripWell/TripDoAllCompleterRoute"),
);

app.use(
  "/tripwell/reflection",
  require("./routes/TripWell/TripReflectionSaveRoutes"),
);
app.use("/tripwell/lookback", require("./routes/TripWell/lookbackRoute"));

app.use("/tripwell/tripbase", require("./routes/TripWell/tripbaseRoutes"));

app.use("/tripwell/start", require("./routes/TripWell/tripStartRoute"));
app.use("/tripwell/tripstatus", require("./routes/TripWell/tripStatusRoute"));
app.use(
  "/tripwell/validateJoinCode",
  require("./routes/TripWell/validateJoinCodeRoute"),
);

// ✅ FIXED: Mount user route cleanly so POST /tripwell/user/createOrFind works
app.use("/tripwell/user", require("./routes/TripWell/TripWellUserRoute"));

app.use(
  "/tripwell/participant/create",
  require("./routes/TripWell/participantUserCreateRoute"),
);

// ✅ NEW: Join Code Availability Check (Originator Flow)
app.use("/tripwell", require("./routes/TripWell/JoinCodeCheckRoute"));

// ✅ Secure Auth-Protected Flow
app.use("/tripwell", verifyFirebaseToken, require("./routes/TripWell/whoami"));
// ✅ FIXED: Mount profile setup route so PUT /tripwell/profile works
app.use(
  "/tripwell",
  verifyFirebaseToken,
  require("./routes/TripWell/profileSetupRoute"),
);

// === ROOT CHECK ===
app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "TripWell Backend API",
    message:
      "🔥 Welcome to the TripWell backend. Routes are mounted under /tripwell.",
    version: "1.0.0",
  });
});

// === SERVER START ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 TripWell backend live on port ${PORT}`);
});
