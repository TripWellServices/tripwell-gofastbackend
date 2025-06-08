const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const admin = require("firebase-admin");
require("dotenv").config();

const app = express();

// === CORS CONFIG (FINAL FULL SEND) ===
const allowedOrigins = [
  "http://localhost:5173",
  "https://tripwell-frontend.vercel.app" // ✅ Deployed frontend
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

// === JSON PARSER ===
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

// === ROUTES ===
app.use("/trip", require("./routes/TripWell/tripRoutes"));
app.use("/trip", require("./routes/TripWell/tripChat"));
app.use("/trip", require("./routes/TripWell/userTripUpdate"));
app.use("/trip", require("./routes/TripWell/profileSetup"));
app.use("/tripwell", require("./routes/TripWell/whoami"));

// === ROOT ROUTE ===
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