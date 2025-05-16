const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// === MIDDLEWARE ===
app.use(cors());
app.use(express.json());

// ✅ Serve static files from /public (for Garmin logo, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// === DB CONNECTION ===
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/gofast', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// === ROUTES ===
const trainingPlanRoutes = require('./routes/trainingplan');
const userRoutes = require('./routes/userRoutes');
const workoutRoutes = require('./routes/workoutRoutes');

app.use('/api/trainingplan', trainingPlanRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workout', workoutRoutes);

// === ROOT TEST ROUTE ===
app.get("/", (req, res) => {
  res.send("GoFast backend is savage.");
});

// === START SERVER ===
app.listen(PORT, () => {
  console.log(`GoFast server running on port ${PORT}`);
});
