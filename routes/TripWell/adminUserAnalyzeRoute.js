const express = require("express");
const router = express.Router();
const axios = require("axios");

// Environment variables
const TRIPWELL_AI_BRAIN = process.env.TRIPWELL_AI_BRAIN || 'https://tripwell-ai.onrender.com';

// POST /tripwell/admin/analyze-user - Analyze user with Python service
router.post("/analyze-user", async (req, res) => {
  try {
    const { userId, email, firstName, lastName, profileComplete, tripId, funnelStage, createdAt } = req.body;
    
    console.log(`🧠 Admin: Analyzing user ${email || userId} with Python service`);
    
    // Prepare the request for Python service
    const analysisRequest = {
      user_id: userId,
      firebase_id: userId, // Use userId as firebase_id for admin testing
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

module.exports = router;
