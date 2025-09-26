// models/TripWell/MarketingData.js - Marketing Email Tracking
const mongoose = require("mongoose");

/*
  MarketingData Schema — Track Marketing Emails
  
  ✅ Created when user completes key actions:
    - Profile Complete → trigger: "profile_complete"
    - Trip Setup → trigger: "trip_setup"
    
  🎯 Python service handles actual email sending
  🎯 This model just tracks what was sent and when
*/

const marketingDataSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'TripWellUser', 
    required: true 
  },
  email: { 
    type: String, 
    required: true 
  },
  trigger: { 
    type: String, 
    required: true,
    enum: ["profile_complete", "trip_setup"]
  },
  sent: { 
    type: Boolean, 
    default: false 
  },
  sentAt: { 
    type: Date, 
    default: null 
  },
  campaign: { 
    type: String, 
    default: null 
  },
  status: { 
    type: String, 
    default: null,
    enum: ["sent", "failed", "bounced", null]
  }
}, { timestamps: true });

// Index for fast lookups
marketingDataSchema.index({ userId: 1 });
marketingDataSchema.index({ trigger: 1 });
marketingDataSchema.index({ sent: 1 });

module.exports = mongoose.model("MarketingData", marketingDataSchema);
