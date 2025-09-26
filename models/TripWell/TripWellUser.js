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
    tripId: { type: mongoose.Schema.Types.ObjectId, default: null }, // set post trip creation
    role: { 
      type: String, 
      default: "noroleset",
      enum: ["noroleset", "originator", "participant"]
    }, // set post trip creation
    
    
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
    
    // === PERSONA WEIGHTS MOVED TO DEDICATED PersonaScore MODEL ===
    // personaScore and planningFlex fields removed - now handled by PersonaScore model
  },
  { timestamps: true }
);


module.exports = mongoose.model("TripWellUser", tripWellUserSchema);
