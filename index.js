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

// === ROUTES ===
const trainingBaseRoutes = require('./routes/trainingbase');
const userRoutes = require('./routes/userRoutes');
const workoutRoutes = require('./routes/workoutRoutes');
const predictorRoutes = require('./routes/predictor');
const garminInitiate = require('./routes/auth/garmin/initiate');
const garminCallback = require('./routes/auth/garmin/callback');

app.use('/api/trainingbase', trainingBaseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workout', workoutRoutes);
app.use('/api', predictorRoutes);
app.use('/auth/garmin/initiate', garminInitiate);
app.use('/auth/garmin/callback', garminCallback);

// === ROOT TEST ROUTE ===
app.get("/", (req, res) => {
  res.send("GoFast backend is savage.");
});

// === START SERVER ===
app.listen(PORT, () => {
  console.log(`GoFast server running on port ${PORT}`);
});
