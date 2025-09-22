/**
 * NeedSmartPromptService - Orchestrates the smart prompt generation flow
 * 
 * Flow:
 * 1. Get user context from MongoDB
 * 2. Call Python to generate smart prompt
 * 3. Return prompt for OpenAI call
 */

const TripPersona = require("../../models/TripWell/TripPersona");
const TripBase = require("../../models/TripWell/TripBase");
const { generatePromptPython } = require('./pythonPromptService');

/**
 * Get user context from MongoDB
 */
async function getUserContext(tripId, userId) {
  const tripPersona = await TripPersona.findOne({ tripId, userId });
  if (!tripPersona) {
    throw new Error("TripPersona not found");
  }
  
  const tripBase = await TripBase.findById(tripId);
  if (!tripBase) {
    throw new Error("TripBase not found");
  }
  
  // Calculate persona weights from primaryPersona
  const personaWeights = {
    art: tripPersona.primaryPersona === 'art' ? 0.6 : 0.1,
    foodie: tripPersona.primaryPersona === 'foodie' ? 0.6 : 0.1,
    adventure: tripPersona.primaryPersona === 'adventure' ? 0.6 : 0.1,
    history: tripPersona.primaryPersona === 'history' ? 0.6 : 0.1
  };
  
  // Note: TripSetup model doesn't exist, using defaults for now
  console.log("⚠️ Using default values for trip setup data");
  
  return {
    city: tripBase.city,
    persona_weights: personaWeights,
    budget: tripPersona.budget,
    budget_level: tripPersona.budgetLevel,
    romance_level: 0.0, // Default values since TripSetup doesn't exist
    caretaker_role: 0.0,
    flexibility: 0.5,
    who_with: "solo",
    daily_spacing: tripPersona.dailySpacing,
    season: tripBase.season,
    purpose: "vacation" // TODO: get from tripBase or tripSetup
  };
}

/**
 * Main service function - gets context and calls Python for prompt
 */
async function needSmartPromptService(tripId, userId) {
  try {
    console.log("🧠 NeedSmartPromptService starting for:", { tripId, userId });
    
    // Step 1: Get user context from MongoDB
    const userContext = await getUserContext(tripId, userId);
    console.log("📋 User context gathered:", userContext);
    
    // Step 2: Call Python to generate smart prompt
    const promptResult = await generatePromptPython(userContext);
    
    if (!promptResult.success) {
      throw new Error(`Python prompt generation failed: ${promptResult.message}`);
    }
    
    console.log("✅ Python prompt generated successfully");
    
    // Step 3: Return prompt for OpenAI call
    return {
      success: true,
      prompt: promptResult.prompt,
      metadata: promptResult.metadata,
      userContext: userContext,
      message: "Smart prompt generated successfully"
    };

  } catch (error) {
    console.error("❌ needSmartPromptService failed:", error);
    return { 
      success: false, 
      message: error.message 
    };
  }
}

module.exports = { needSmartPromptService };
