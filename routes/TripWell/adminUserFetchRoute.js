const express = require("express");
const router = express.Router();
const TripWellUser = require("../../models/TripWell/TripWellUser");

// GET /tripwell/admin/users - Fetch all users for admin dashboard
router.get("/users", async (req, res) => {
  try {
    console.log("📊 Admin fetching all users from MongoDB...");
    const users = await TripWellUser.find({}).sort({ createdAt: -1 });
    
    console.log(`📊 Found ${users.length} users in database`);
    
    // Transform data for admin dashboard with Python user state
    const adminUsers = users.map(user => ({
      userId: user._id,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      createdAt: user.createdAt,
      lastActiveAt: user.updatedAt,
      tripId: user.tripId,
      tripCreatedAt: user.tripId ? user.createdAt : null,
      tripCompletedAt: null,
      role: user.role || 'noroleset',
      profileComplete: user.profileComplete || false,
      funnelStage: user.funnelStage || 'none',
      // ✅ Python-interpreted user state
      userState: user.userState || 'active', // Default to active
      journeyStage: user.journeyStage || 'new_user', // Default to new_user
      engagementLevel: user.engagementLevel || 'onboarding',
      lastAnalyzedAt: user.lastAnalyzedAt
    }));
    
    console.log(`📊 Returning ${adminUsers.length} users to frontend`);
    res.json(adminUsers);
  } catch (error) {
    console.error("❌ Admin users fetch error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

module.exports = router;
