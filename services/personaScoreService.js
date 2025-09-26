// services/personaScoreService.js
const PersonaScore = require("../models/TripWell/PersonaScore");

/*
  PersonaScore Service
  
  ✅ Calculates user decision weights based on selections
  ✅ Individual fields for easy querying and mutation
  ✅ Never hardcoded - all logic in service
*/

const calculatePersonaScores = (userSelections) => {
  const { persona, planningStyle } = userSelections;
  
  // Initialize all persona scores to 0.0 (points system)
  const personaScores = {
    Art: 0.0,
    Food: 0.0,
    History: 0.0,
    Adventure: 0.0
  };
  
  // Set selected persona to 0.5 (standard points)
  if (persona && personaScores.hasOwnProperty(persona)) {
    personaScores[persona] = 0.5;
  }
  
  // Initialize all planning scores to default
  const planningScores = {
    Spontaneous: 0.5,
    "Mix of spontaneous and planned": 0.5,
    "Set a plan and stick to it!": 0.5
  };
  
  // Set planning style scores based on selection
  if (planningStyle) {
    switch (planningStyle) {
      case "Spontaneous":
        planningScores.Spontaneous = 0.4;
        planningScores["Mix of spontaneous and planned"] = 0.3;
        planningScores["Set a plan and stick to it!"] = 0.3;
        break;
      case "Mix of spontaneous and planned":
        planningScores.Spontaneous = 0.3;
        planningScores["Mix of spontaneous and planned"] = 0.4;
        planningScores["Set a plan and stick to it!"] = 0.3;
        break;
      case "Set a plan and stick to it!":
        planningScores.Spontaneous = 0.3;
        planningScores["Mix of spontaneous and planned"] = 0.3;
        planningScores["Set a plan and stick to it!"] = 0.4;
        break;
      default:
        // Keep defaults
        break;
    }
  }
  
  return { personaScores, planningScores };
};

const savePersonaScores = async (userId, userSelections) => {
  try {
    console.log(`🧮 Calculating persona scores for user ${userId}`);
    
    const { personaScores, planningScores } = calculatePersonaScores(userSelections);
    
    // Create or update PersonaScore
    const personaScore = await PersonaScore.findOneAndUpdate(
      { userId },
      {
        userId,
        personaScores,
        planningScores,
        calculatedAt: new Date(),
        calculationVersion: "1.0"
      },
      { upsert: true, new: true }
    );
    
    console.log(`✅ Persona scores saved:`, {
      userId,
      personaScores,
      planningScores
    });
    
    return personaScore;
    
  } catch (error) {
    console.error(`❌ Error saving persona scores for user ${userId}:`, error);
    throw error;
  }
};

const getPersonaScores = async (userId) => {
  try {
    return await PersonaScore.findOne({ userId });
  } catch (error) {
    console.error(`❌ Error getting persona scores for user ${userId}:`, error);
    throw error;
  }
};

// Query helpers
const findArtPeople = async (minScore = 0.5) => {
  return await PersonaScore.find({ "personaScores.Art": { $gt: minScore } });
};

const findFoodPeople = async (minScore = 0.5) => {
  return await PersonaScore.find({ "personaScores.Food": { $gt: minScore } });
};

module.exports = {
  calculatePersonaScores,
  savePersonaScores,
  getPersonaScores,
  findArtPeople,
  findFoodPeople
};
