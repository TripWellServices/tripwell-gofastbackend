const express = require("express");
const router = express.Router();
const axios = require("axios");

// Environment variables
const TRIPWELL_AI_BRAIN = process.env.TRIPWELL_AI_BRAIN || 'https://tripwell-ai.onrender.com';

// POST /tripwell/admin/analyze-user - Analyze user with Python service
router.post("/analyze-user", async (req, res) => {
  try {
    console.log('🎯 ADMIN USER ANALYZE ROUTE HIT!');
    console.log('📥 Request body:', req.body);
    
    const { user_id, userId, email, firstName, lastName, profileComplete, tripId, funnelStage, createdAt } = req.body;
    
    // Use user_id from frontend, fallback to userId for backward compatibility
    const actualUserId = user_id || userId;
    
    if (!actualUserId) {
      console.error('❌ No user_id provided in request');
      return res.status(400).json({
        success: false,
        error: "Missing user_id",
        message: "user_id is required for analysis"
      });
    }
    
    console.log(`🧠 Admin: Analyzing user ${email || actualUserId} with Python service`);
    
    // Prepare the request for Python service
    const analysisRequest = {
      user_id: actualUserId, // This is the MongoDB _id (ObjectId)
      firebase_id: actualUserId, // Use actualUserId as firebase_id for admin testing
      email: email,
      firstName: firstName,
      lastName: lastName,
      profileComplete: profileComplete,
      tripId: tripId,
      funnelStage: funnelStage,
      createdAt: createdAt,
      context: 'admin_test',
      hints: {
        user_type: 'existing_user',
        entry_point: 'admin_test',
        has_profile: profileComplete || false,
        has_trip: !!tripId,
        days_since_signup: createdAt ? 
          Math.floor((new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24)) : 0
      }
    };

    console.log('📤 Sending to Python service:', analysisRequest);

    // Call Python service
    const pythonResponse = await axios.post(`${TRIPWELL_AI_BRAIN}/analyze-user`, analysisRequest, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 15000 // Give Python time to analyze
    });

    if (pythonResponse.data.success) {
      console.log(`✅ Python analysis complete for admin test: ${email}`);
      console.log(`📊 User state: ${pythonResponse.data.user_state?.user_state || 'unknown'}`);
      console.log(`🎯 Journey stage: ${pythonResponse.data.user_state?.journey_stage || 'unknown'}`);
      console.log(`📧 Actions taken: ${pythonResponse.data.actions_taken?.length || 0}`);
      
      res.json({
        success: true,
        message: "User analysis complete",
        python_response: pythonResponse.data
      });
    } else {
      console.error(`❌ Python analysis failed for admin test: ${email}`);
      res.status(500).json({
        success: false,
        error: "Python analysis failed",
        message: pythonResponse.data.message || "Unknown error"
      });
    }
    
  } catch (error) {
    console.error('❌ Admin user analysis error:', error.message);
    
    if (error.response) {
      // Python service responded with error
      res.status(error.response.status).json({
        success: false,
        error: "Python service error",
        message: error.response.data?.message || error.response.statusText,
        details: error.response.data
      });
    } else if (error.request) {
      // Network error - couldn't reach Python service
      res.status(503).json({
        success: false,
        error: "Python service unavailable",
        message: "Could not connect to Python analysis service"
      });
    } else {
      // Other error
      res.status(500).json({
        success: false,
        error: "Internal server error",
        message: error.message
      });
    }
  }
});

// GET /tripwell/get-user/:userId - Get updated user data via Python service
router.get("/get-user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('🔍 Fetching updated user data for:', userId);
    
    // Call Python service to get user data from MongoDB
    const pythonResponse = await axios.get(`${TRIPWELL_AI_BRAIN}/get-user/${userId}`, {
      timeout: 10000
    });
    
    if (pythonResponse.data.success) {
      console.log('✅ Found user via Python service:', pythonResponse.data.user.email);
      console.log('📊 User state fields:', {
        journeyStage: pythonResponse.data.user.journeyStage,
        userState: pythonResponse.data.user.userState,
        engagementLevel: pythonResponse.data.user.engagementLevel,
        lastAnalyzedAt: pythonResponse.data.user.lastAnalyzedAt
      });
      
      res.json({
        success: true,
        user: pythonResponse.data.user
      });
    } else {
      console.log('❌ User not found via Python service:', userId);
      res.status(404).json({
        success: false,
        error: "User not found"
      });
    }
    
  } catch (error) {
    console.error('❌ Error fetching user:', error.message);
    
    if (error.response) {
      res.status(error.response.status).json({
        success: false,
        error: "Python service error",
        message: error.response.data?.message || error.response.statusText
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Failed to fetch user data",
        message: error.message
      });
    }
  }
});

module.exports = router;
