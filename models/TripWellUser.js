const mongoose = require("mongoose");

/*
  TripWellUser Schema — MVP1 Canon

  ✅ Saved during Firebase Auth (Access.jsx):
    - firebaseId → from auth.currentUser.uid
    - email → from auth.currentUser.email

  ✅ Saved during Profile Setup (ProfileSetup.jsx):
    - firstName → user input
    - lastName → user input
    - hometownCity → "City/State You Call Home"
    - homeState → dropdown
    - travelStyle → [String] checkbox group
    - tripVibe → [String] checkbox group

  🛠️ Assigned later (after trip creation — backend):
    - role → "originator" or "participant"
    - tripId → assigned by backend service logic
*/

const tripWellUserSchema = new mongoose.Schema(
  {
    firebaseId: { type: String, required: true, unique: true },
    email: { type: String, default: "" },
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    hometownCity: { type: String, default: "" },
    homeState: { type: String, default: "" },
    persona: { type: String, default: "" }, // Persona: "Art", "Food", "History", "Adventure"
    planningStyle: { type: String, default: "" }, // Planning style: "Spontaneity", "Flow", "Rigid"
    dreamDestination: { type: String, default: "" }, // Dream destination from ProfileSetup
    profileComplete: { type: Boolean, default: false }, // tracks if profile setup is complete
    userStatus: { type: String, default: "signup", enum: ["demo_only", "signup", "active", "abandoned", "inactive"] }, // user status for routing
    tripId: { type: mongoose.Schema.Types.ObjectId, default: null }, // set post trip creation
    role: { 
      type: String, 
      default: "noroleset",
      enum: ["noroleset", "originator", "participant"]
    }, // set post trip creation
    funnelStage: {
      type: String,
      default: "none",
      enum: ["none", "spots_demo", "itinerary_demo", "vacation_planner_demo", "updates_only", "full_app"]
    }, // tracks user's funnel progression
    
    // New fields for Python analysis
    journeyStage: {
      type: String,
      default: "new_user",
      enum: ["new_user", "profile_complete", "trip_set_done", "itinerary_complete", "trip_active", "trip_complete"]
    }, // where user is in the journey flow
    
    
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
    }, // track last marketing email sent to prevent duplicates
    
    // === ENDURING PERSONA WEIGHTS (from ProfileSetup radio answers) ===
    personaScore: { type: Number, default: 0.1 }, // "Art", "Food", "History", "Adventure" = 0.6, others = 0.1
    planningFlex: { type: Number, default: 0.5 } // "Spontaneity" = 0.4, "Flow" = 0.1, "Rigid" = 0.0
  },
  { timestamps: true }
);


module.exports = mongoose.model("TripWellUser", tripWellUserSchema);
