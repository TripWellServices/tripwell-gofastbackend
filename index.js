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
  const serviceAccount = require("./firebaseServiceKey.json"); // 🔐 Make sure this exists!
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// === Mongo Connection ===
mongoose
  .connect(process.env.MONGO_URI, {
    dbName: "GoFastFamily",
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// === Routes ===
app.use("/trip", require("./routes/TripWell/tripRoutes"));      // Trip creation, join, etc.
app.use("/trip", require("./routes/TripWell/tripChat"));        // GPT chat
app.use("/auth", require("./routes/auth/userRoutes"));          // General auth
app.use("/tripwell", require("./routes/TripWell/whoami"));      // ✅ Scoped TripWell whoami route

// === Root Route ===
app.get("/", (req, res) => {
  res.send("🌍 TripWell / GoFast backend is up and running.");
});

// === Server Boot ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));
