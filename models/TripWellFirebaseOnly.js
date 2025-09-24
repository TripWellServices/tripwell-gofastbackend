// models/TripWellFirebaseOnly.js - FIREBASE AUTH ONLY
const mongoose = require("mongoose");

/*
  TripWellFirebaseOnly Schema — Firebase Auth Only
  
  ✅ Saved during Firebase Auth (Signup.jsx):
    - firebaseId → from auth.currentUser.uid
    - email → from auth.currentUser.email
    
  🚀 Service transfers to TripWellUser.js (source of truth)
  🚀 TripWellUser.js handles profileComplete flag logic
*/

const tripWellFirebaseOnlySchema = new mongoose.Schema({
  firebaseId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  email: { 
    type: String, 
    required: true 
  },
  
  // Transfer status
  transferredToTripWellUser: { 
    type: Boolean, 
    default: false 
  },
  transferredAt: { 
    type: Date, 
    default: null 
  }
}, { timestamps: true });

// Index for fast lookups
tripWellFirebaseOnlySchema.index({ firebaseId: 1 });
tripWellFirebaseOnlySchema.index({ transferredToTripWellUser: 1 });

module.exports = mongoose.model("TripWellFirebaseOnly", tripWellFirebaseOnlySchema);
