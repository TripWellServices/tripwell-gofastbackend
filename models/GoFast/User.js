const mongoose = require("mongoose");

/**
 * User Model - MINIMAL (Just Firebase Auth)
 * Created on Google sign-in, THAT'S IT!
 * Runner details go in RunnerProfile model
 */
const userSchema = new mongoose.Schema({
  // 🔐 Firebase Auth (ONLY FIELDS ON AUTH!)
  firebaseId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true
  },
  
  email: { 
    type: String, 
    required: true,
    index: true
  },

  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);