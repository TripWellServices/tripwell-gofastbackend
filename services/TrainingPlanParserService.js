const RaceIntent = require('../models/GoFast/RaceIntent');
const TrainingPlan = require('../models/GoFast/TrainingPlan');
const TrainingDay = require('../models/GoFast/TrainingDay');

/**
 * TrainingPlanParserService - Like TripWell's TripParser
 * Parses GPT response and creates TrainingPlan + TrainingDays
 */
class TrainingPlanParserService {

  /**
   * Parse GPT response and create training plan
   */
  static async parseAndCreateTrainingPlan(raceIntentId) {
    try {
      console.log(`📋 Parsing GPT response for RaceIntent: ${raceIntentId}`);
      
      const raceIntent = await RaceIntent.findById(raceIntentId);
      if (!raceIntent) {
        throw new Error('RaceIntent not found');
      }

      if (raceIntent.gptProcessingStatus !== 'completed') {
        throw new Error('GPT processing not completed');
      }

      // Parse GPT response
      const planData = this.parseGPTResponse(raceIntent.gptResponse);
      
      // Create TrainingPlan
      const trainingPlan = await this.createTrainingPlan(raceIntent, planData);
      
      // Create TrainingDays
      const trainingDays = await this.createTrainingDays(trainingPlan, planData);
      
      // Update RaceIntent
      raceIntent.trainingPlanId = trainingPlan._id;
      raceIntent.status = 'plan_generated';
      await raceIntent.save();

      console.log(`✅ Training plan parsed and created: ${trainingDays.length} days`);
      
      return {
        success: true,
        trainingPlan,
        trainingDays,
        totalDays: trainingDays.length
      };

    } catch (error) {
      console.error('❌ Training plan parsing failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Parse GPT JSON response
   */
  static parseGPTResponse(gptResponse) {
    try {
      // Extract JSON from GPT response (handle markdown code blocks)
      let jsonStr = gptResponse;
      
      // Remove markdown code blocks if present
      if (jsonStr.includes('```json')) {
        jsonStr = jsonStr.split('```json')[1].split('```')[0];
      } else if (jsonStr.includes('```')) {
        jsonStr = jsonStr.split('```')[1].split('```')[0];
      }
      
      // Clean up the JSON string
      jsonStr = jsonStr.trim();
      
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('❌ Failed to parse GPT JSON response:', error);
      throw new Error('Invalid GPT response format');
    }
  }

  /**
   * Create TrainingPlan from parsed data
   */
  static async createTrainingPlan(raceIntent, planData) {
    const trainingPlan = new TrainingPlan({
      userId: raceIntent.userId,
      raceId: raceIntent._id, // Link to RaceIntent
      name: planData.planName || `${raceIntent.raceType} Training Plan`,
      totalWeeks: planData.totalWeeks,
      status: 'generated',
      phases: planData.phases || [],
      metadata: {
        raceType: raceIntent.raceType,
        goalTime: raceIntent.goalTime,
        currentMileage: raceIntent.currentWeeklyMileage,
        trainingDaysPerWeek: raceIntent.trainingDaysPerWeek
      }
    });

    await trainingPlan.save();
    return trainingPlan;
  }

  /**
   * Create TrainingDays from parsed data
   */
  static async createTrainingDays(trainingPlan, planData) {
    const trainingDays = [];
    
    for (const weekData of planData.weeks) {
      for (const dayData of weekData.days) {
        // Skip rest days
        if (dayData.type === 'rest') {
          continue;
        }

        // Calculate date (simplified - would need proper date calculation)
        const trainingDay = new TrainingDay({
          trainingPlanId: trainingPlan._id,
          userId: trainingPlan.userId,
          weekNumber: weekData.weekNumber,
          dayOfWeek: dayData.day,
          planned: {
            type: dayData.type,
            distance: dayData.distance || 0,
            description: dayData.description,
            duration: this.estimateDuration(dayData.type, dayData.distance),
            pace: this.estimatePace(dayData.type, trainingPlan.metadata.goalTime)
          },
          actual: {
            completed: false,
            distance: 0,
            duration: 0,
            pace: null,
            notes: ''
          },
          status: 'planned'
        });

        await trainingDay.save();
        trainingDays.push(trainingDay);
      }
    }

    return trainingDays;
  }

  /**
   * Estimate workout duration based on type and distance
   */
  static estimateDuration(type, distance) {
    const basePace = 9; // 9 min/mile base pace
    
    switch (type) {
      case 'easy':
        return distance * (basePace + 1) * 60; // seconds
      case 'tempo':
        return distance * (basePace - 0.5) * 60;
      case 'intervals':
        return distance * (basePace - 1) * 60;
      case 'long_run':
        return distance * (basePace + 0.5) * 60;
      default:
        return distance * basePace * 60;
    }
  }

  /**
   * Estimate pace based on workout type and goal time
   */
  static estimatePace(type, goalTime) {
    // Parse goal time (simplified)
    const goalPace = this.parseGoalTimeToPace(goalTime);
    
    switch (type) {
      case 'easy':
        return goalPace + 60; // 1 min slower per mile
      case 'tempo':
        return goalPace - 15; // 15 sec faster per mile
      case 'intervals':
        return goalPace - 30; // 30 sec faster per mile
      case 'long_run':
        return goalPace + 30; // 30 sec slower per mile
      default:
        return goalPace;
    }
  }

  /**
   * Parse goal time string to pace per mile (in seconds)
   */
  static parseGoalTimeToPace(goalTime) {
    // Handle different formats: "25:30", "1:45:00", etc.
    const parts = goalTime.split(':').map(Number);
    
    if (parts.length === 2) {
      // 5K/10K format: "25:30"
      return (parts[0] * 60 + parts[1]) / 3.1; // 5K distance
    } else if (parts.length === 3) {
      // Half/Marathon format: "1:45:00"
      return (parts[0] * 3600 + parts[1] * 60 + parts[2]) / 13.1; // Half distance
    }
    
    return 600; // Default 10 min/mile
  }
}

module.exports = TrainingPlanParserService;
