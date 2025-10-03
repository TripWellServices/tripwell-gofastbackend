const OpenAI = require('openai');
const RaceIntent = require('../models/GoFast/RaceIntent');
const RunnerProfile = require('../models/GoFast/RunnerProfile');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * TrainingPlanGPTService - Like TripWell's TripItineraryGPT
 * Generates training plans using GPT based on RaceIntent
 */
class TrainingPlanGPTService {
  
  /**
   * Generate training plan prompt from RaceIntent
   */
  static buildTrainingPlanPrompt(raceIntent, runnerProfile) {
    const weeksAway = Math.ceil((raceIntent.raceDate - new Date()) / (7 * 24 * 60 * 60 * 1000));
    
    return `You are an expert running coach. Generate a detailed ${raceIntent.raceType} training plan.

RUNNER PROFILE:
- Current 5K time: ${runnerProfile.baseline5k}
- Weekly mileage: ${raceIntent.currentWeeklyMileage} miles
- Training days per week: ${raceIntent.trainingDaysPerWeek}
- Preferred long run day: ${raceIntent.preferredLongRunDay}

RACE GOAL:
- Race: ${raceIntent.raceName} (${raceIntent.raceType})
- Race date: ${raceIntent.raceDate.toDateString()}
- Goal time: ${raceIntent.goalTime}
- Weeks until race: ${weeksAway}
- Location: ${raceIntent.location || 'Not specified'}

TRAINING PLAN REQUIREMENTS:
1. Create a ${weeksAway}-week training plan
2. Include base building, peak training, and taper phases
3. Mix of easy runs, tempo runs, intervals, and long runs
4. Progressive mileage increase (max 10% per week)
5. Include rest days and recovery weeks
6. Peak 2-3 weeks before race, then taper

OUTPUT FORMAT (JSON):
{
  "planName": "Custom ${raceIntent.raceType} Training Plan",
  "totalWeeks": ${weeksAway},
  "phases": [
    {
      "name": "Base Building",
      "weeks": [1, 2, 3, 4],
      "description": "Build aerobic base and mileage"
    },
    {
      "name": "Peak Training", 
      "weeks": [5, 6, 7, 8],
      "description": "High intensity workouts and peak mileage"
    },
    {
      "name": "Taper",
      "weeks": [9, 10, 11, 12],
      "description": "Reduce volume, maintain intensity"
    }
  ],
  "weeks": [
    {
      "weekNumber": 1,
      "totalMileage": 20,
      "description": "Base building week 1",
      "days": [
        {
          "day": "Monday",
          "type": "rest",
          "description": "Rest day"
        },
        {
          "day": "Tuesday", 
          "type": "easy",
          "distance": 3,
          "description": "Easy 3 mile run"
        },
        {
          "day": "Wednesday",
          "type": "rest", 
          "description": "Rest day"
        },
        {
          "day": "Thursday",
          "type": "tempo",
          "distance": 4,
          "description": "2 mile warmup, 1 mile tempo, 1 mile cooldown"
        },
        {
          "day": "Friday",
          "type": "rest",
          "description": "Rest day"
        },
        {
          "day": "Saturday",
          "type": "long_run",
          "distance": 6,
          "description": "Long run at easy pace"
        },
        {
          "day": "Sunday",
          "type": "easy",
          "distance": 3,
          "description": "Easy recovery run"
        }
      ]
    }
  ]
}

Make sure the plan is realistic for the runner's current fitness level and builds progressively toward the race goal.`;
  }

  /**
   * Call GPT to generate training plan
   */
  static async generateTrainingPlan(raceIntentId) {
    try {
      console.log(`🤖 Starting GPT training plan generation for RaceIntent: ${raceIntentId}`);
      
      // Get RaceIntent with runner profile
      const raceIntent = await RaceIntent.findById(raceIntentId)
        .populate('runnerProfileId');
      
      if (!raceIntent) {
        throw new Error('RaceIntent not found');
      }

      if (!raceIntent.runnerProfileId) {
        throw new Error('RunnerProfile not found');
      }

      // Update status to processing
      raceIntent.gptProcessingStatus = 'processing';
      await raceIntent.save();

      // Build prompt
      const prompt = this.buildTrainingPlanPrompt(raceIntent, raceIntent.runnerProfileId);
      raceIntent.gptPrompt = prompt;
      await raceIntent.save();

      // Call GPT
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert running coach. Generate detailed, personalized training plans in JSON format."
          },
          {
            role: "user", 
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      });

      const gptResponse = completion.choices[0].message.content;
      
      // Save GPT response
      raceIntent.gptResponse = gptResponse;
      raceIntent.gptProcessingStatus = 'completed';
      await raceIntent.save();

      console.log(`✅ GPT training plan generated successfully`);
      return {
        success: true,
        raceIntent,
        gptResponse
      };

    } catch (error) {
      console.error('❌ GPT training plan generation failed:', error);
      
      // Update RaceIntent with error
      const raceIntent = await RaceIntent.findById(raceIntentId);
      if (raceIntent) {
        raceIntent.gptProcessingStatus = 'failed';
        raceIntent.gptError = error.message;
        await raceIntent.save();
      }

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get GPT response for a RaceIntent
   */
  static async getGPTResponse(raceIntentId) {
    const raceIntent = await RaceIntent.findById(raceIntentId);
    
    if (!raceIntent) {
      throw new Error('RaceIntent not found');
    }

    return {
      status: raceIntent.gptProcessingStatus,
      prompt: raceIntent.gptPrompt,
      response: raceIntent.gptResponse,
      error: raceIntent.gptError
    };
  }
}

module.exports = TrainingPlanGPTService;
