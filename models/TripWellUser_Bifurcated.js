// models/TripWellUser_Bifurcated.js - AUTH ONLY
const mongoose = require("mongoose");

/*
  TripWellUser Schema — BIFURCATED VERSION (Auth Only)
  
  ✅ Saved during Firebase Auth (Signup.jsx):
    - firebaseId → from auth.currentUser.uid
    - email → from auth.currentUser.email
    
  ✅ Admin/Analytics fields:
    - userStatus → for admin user management
    - journeyStage → for backend business logic
    - funnelStage → for analytics (legacy)
    
  🚫 REMOVED (moved to TripWellLiveUser):
    - firstName, lastName, hometownCity, homeState
    - travelStyle, tripVibe, dreamDestination
    - persona, planningStyle, personaScore, planningFlex
    - profileComplete (NO MORE FLAGS!)
    - tripId, role (moved to TripWellLiveUser)
*/

const tripWellUserSchema = new mongoose.Schema(
  {
    // AUTH DATA ONLY
    firebaseId: { type: String, required: true, unique: true },
    email: { type: String, default: "" },
    
    // ADMIN/ANALYTICS FIELDS
    userStatus: { 
      type: String, 
      default: "signup", 
      enum: ["demo_only", "signup", "active", "abandoned", "inactive"] 
    }, // user status for admin management
    
    journeyStage: {
      type: String,
      default: "new_user",
      enum: ["new_user", "profile_complete", "trip_set_done", "itinerary_complete", "trip_active", "trip_complete"]
    }, // where user is in the journey flow (backend business logic)
    
    funnelStage: {
      type: String,
      default: "none",
      enum: ["none", "spots_demo", "itinerary_demo", "vacation_planner_demo", "updates_only", "full_app"]
    }, // tracks user's funnel progression (legacy)
    
    lastAnalyzedAt: {
      type: Date,
      default: null
    }, // when Python last analyzed this user
    
    lastMarketingEmail: {
      sentAt: { type: Date, default: null },
      campaign: { type: String, default: null },
      status: { 
        type: String, 
        default: null,
        enum: ["sent", "failed", "bounced", null]
      }
    } // track last marketing email sent to prevent duplicates
  },
  { timestamps: true }
);

module.exports = mongoose.model("TripWellUser", tripWellUserSchema);
