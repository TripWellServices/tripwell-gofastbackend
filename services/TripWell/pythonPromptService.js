/**
 * Python Prompt Service - Bridges Node.js to Python AI service
 * Only handles calling Python to generate prompts
 */

const axios = require('axios');

// Get Python service URL from environment
const PYTHON_SERVICE_URL = process.env.TRIPWELL_AI_BRAIN || 'http://localhost:5000';

/**
 * Generate rich prompt using Python service
 * @param {Object} requestData - Sample generation request
 * @returns {Object} Generated prompt
 */
async function generatePromptPython(requestData) {
  try {
    console.log("🐍 Calling Python prompt generation service...");
    console.log("🐍 Request data:", JSON.stringify(requestData, null, 2));

    const response = await axios.post(`${PYTHON_SERVICE_URL}/generate-prompt`, {
      city: requestData.city,
      persona_weights: requestData.persona_weights,
      budget_level: requestData.budget_level,
      romance_level: requestData.romance_level,
      caretaker_role: requestData.caretaker_role,
      flexibility: requestData.flexibility,
      who_with: requestData.who_with,
      daily_spacing: requestData.daily_spacing,
      season: requestData.season,
      purpose: requestData.purpose,
      budget: requestData.budget
    }, {
      timeout: 30000, // 30 second timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data.status === 'success') {
      console.log("✅ Python prompt generation successful");
      
      return {
        success: true,
        prompt: response.data.prompt,
        metadata: response.data.metadata,
        message: "Prompt generated successfully"
      };
    } else {
      console.error("❌ Python service returned error:", response.data.message);
      return {
        success: false,
        prompt: "",
        metadata: {},
        message: response.data.message || "Python service error"
      };
    }

  } catch (error) {
    console.error("❌ Python prompt generation failed:", error.message);
    
    // Handle different types of errors
    if (error.code === 'ECONNREFUSED') {
      console.error("❌ Python service is not running or not accessible");
      return {
        success: false,
        prompt: "",
        metadata: {},
        message: "Python service is not running. Please start the Python AI service."
      };
    } else if (error.code === 'ECONNABORTED') {
      console.error("❌ Python service request timed out");
      return {
        success: false,
        prompt: "",
        metadata: {},
        message: "Python service request timed out. Please try again."
      };
    } else {
      return {
        success: false,
        prompt: "",
        metadata: {},
        message: `Python service error: ${error.message}`
      };
    }
  }
}

/**
 * Check if Python service is healthy
 */
async function checkPythonServiceHealth() {
  try {
    const response = await axios.get(`${PYTHON_SERVICE_URL}/health`, {
      timeout: 5000
    });
    
    return {
      healthy: true,
      status: response.data.status || 'unknown',
      message: 'Python service is running'
    };
  } catch (error) {
    return {
      healthy: false,
      status: 'error',
      message: `Python service is not accessible: ${error.message}`
    };
  }
}

module.exports = {
  generatePromptPython,
  checkPythonServiceHealth
};
