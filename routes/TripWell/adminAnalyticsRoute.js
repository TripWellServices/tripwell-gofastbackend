const express = require("express");
const router = express.Router();
const TripWellUser = require("../../models/TripWellUser");
const TripBase = require("../../models/TripWell/TripBase");

// Simple admin auth middleware
const verifyAdminAuth = (req, res, next) => {
  const { username, password } = req.headers;
  
  // Simple admin credentials - in production, use environment variables
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'tripwell2025';
  
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    next();
  } else {
    res.status(401).json({ error: "Invalid admin credentials" });
  }
};

// GET /tripwell/admin/analytics - Get basic analytics
router.get("/analytics", verifyAdminAuth, async (req, res) => {
  try {
    // Get user counts
    const totalUsers = await TripWellUser.countDocuments();
    const usersWithTrips = await TripWellUser.countDocuments({ tripId: { $ne: null } });
    const usersWithoutTrips = totalUsers - usersWithTrips;
    
    // Get trip counts
    const totalTrips = await TripBase.countDocuments();
    const completedTrips = await TripBase.countDocuments({ 
      endDate: { $lt: new Date() } 
    });
    const activeTrips = totalTrips - completedTrips;
    
    // Get role distribution
    const originators = await TripWellUser.countDocuments({ role: "originator" });
    const participants = await TripWellUser.countDocuments({ role: "participant" });
    const noRole = await TripWellUser.countDocuments({ role: "noroleset" });
    
    // Get profile completion stats
    const profilesComplete = await TripWellUser.countDocuments({ profileComplete: true });
    const profilesIncomplete = totalUsers - profilesComplete;
    
    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentUsers = await TripWellUser.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });
    
    const recentTrips = await TripBase.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });
    
    const analytics = {
      users: {
        total: totalUsers,
        withTrips: usersWithTrips,
        withoutTrips: usersWithoutTrips,
        profilesComplete,
        profilesIncomplete,
        recent: recentUsers
      },
      trips: {
        total: totalTrips,
        active: activeTrips,
        completed: completedTrips,
        recent: recentTrips
      },
      roles: {
        originators,
        participants,
        noRole
      },
      recentActivity: {
        last7Days: {
          newUsers: recentUsers,
          newTrips: recentTrips
        }
      }
    };
    
    res.json(analytics);
  } catch (error) {
    console.error("❌ Admin analytics error:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

module.exports = router;
