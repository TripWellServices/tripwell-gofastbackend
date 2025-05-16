const mongoose = require('mongoose');

// Connect to MongoDB Atlas
mongoose.connect('mongodb+srv://adamgofast:GoFast00!@gofast-matching.khwb4ig.mongodb.net/?retryWrites=true&w=majority&appName=GoFast-Matching', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB Atlas');
  insertDummyUser();
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
});

// Define schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  motivation: {
    type: [String],
    enum: ['Get fit', 'Race training', 'Stay consistent'],
  },
  vibe: {
    type: [String],
    enum: ['Chatty', 'Focused', 'Social but serious'],
  },
  preferredTime: {
    type: String,
    enum: ['Morning', 'Afternoon', 'Evening'],
  }
});

// Create model
const User = mongoose.model('User', userSchema);

// Insert dummy data
async function insertDummyUser() {
  const newUser = new User({
    name: 'Jenny Test',
    email: 'jenny@gofast.com',
    motivation: ['Race training'],
    vibe: ['Chatty', 'Focused'],
    preferredTime: 'Morning',
  });

  try {
    const result = await newUser.save();
    console.log('✅ Dummy user inserted:', result);
    mongoose.connection.close();
  } catch (err) {
    console.error('❌ Error inserting user:', err);
  }
}
