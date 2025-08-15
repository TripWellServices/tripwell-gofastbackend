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
    - state → dropdown
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
    state: { type: String, default: "" },
    travelStyle: { type: [String], default: [] },
    tripVibe: { type: [String], default: [] },
    profileComplete: { type: Boolean, default: false }, // tracks if profile setup is complete
    tripId: { type: mongoose.Schema.Types.ObjectId, default: null }, // set post trip creation
    role: { type: String, default: "noroleset" } // set post trip creation
  },
  { timestamps: true }
);

module.exports = mongoose.model("TripWellUser", tripWellUserSchema);
