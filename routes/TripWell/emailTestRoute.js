// emailTestRoute.js
// Simple test route for email functionality

const express = require("express");
const router = express.Router();
const axios = require("axios");

// Environment variables
const MAIN_SERVICE_URL = process.env.MAIN_SERVICE_URL || "http://localhost:8000";

/**
 * Test email endpoint
 * POST /tripwell/email-test
 */
router.post("/", async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: "Email and name are required"
      });
    }

    console.log(`🧪 Testing email flow for ${email} (${name})`);

    // Call Python Smart Service with context and hints
    const testResponse = await axios.post(`${MAIN_SERVICE_URL}/analyze-user`, {
      firebase_id: `test_${Date.now()}`,
      email: email,
      firstName: name.split(' ')[0] || name,
      lastName: name.split(' ').slice(1).join(' ') || '',
      context: "new_user_test",
      hints: {
        user_type: "new_user",
        entry_point: "test",
        has_profile: false,
        has_trip: false,
        days_since_signup: 0,
        signup_method: "test_form"
      }
    }, {
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (testResponse.data.success) {
      console.log(`✅ Welcome email sent successfully to ${email}`);
      
      return res.status(200).json({
        success: true,
        message: "Welcome email sent successfully",
        email: email,
        name: name,
        python_response: testResponse.data
      });
    } else {
      console.error(`❌ Test email flow failed for ${email}`);
      return res.status(500).json({
        success: false,
        message: "Test email flow failed",
        error: testResponse.data
      });
    }

  } catch (error) {
    console.error("❌ Error in test email flow:", error.message);
    
    return res.status(500).json({
      success: false,
      message: "Test email flow failed",
      error: error.message
    });
  }
});

module.exports = router;
