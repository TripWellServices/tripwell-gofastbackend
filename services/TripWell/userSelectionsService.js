const UserSelections = require('../../models/TripWell/UserSelections');
const TripBase = require('../../models/TripWell/TripBase');
const MetaAttractions = require('../../models/TripWell/MetaAttractions');

/**
 * Save user's meta attraction selections to database
 */
async function saveMetaSelections(tripId, userId, selectedMetaNames) {
  try {
    console.log('💾 Saving meta selections:', { tripId, userId, selectedMetaNames });
    
    // Get the full meta attraction data
    const tripBase = await TripBase.findById(tripId);
    if (!tripBase) throw new Error('Trip not found');
    
    const metaAttractions = await MetaAttractions.findOne({ cityId: tripBase.cityId });
    if (!metaAttractions) throw new Error('Meta attractions not found');
    
    // Filter selected metas from the full data
    const selectedMetas = metaAttractions.metaAttractions.filter(meta => 
      selectedMetaNames.includes(meta.name)
    );
    
    // Find or create user selections
    let userSelections = await UserSelections.findOne({ tripId, userId });
    
    if (!userSelections) {
      userSelections = new UserSelections({
        tripId,
        userId,
        selectedMetas: [],
        selectedSamples: []
      });
    }
    
    // Update selected metas
    userSelections.selectedMetas = selectedMetas.map(meta => ({
      name: meta.name,
      type: meta.type,
      reason: meta.reason,
      selectedAt: new Date()
    }));
    
    await userSelections.save();
    
    console.log('✅ Meta selections saved:', userSelections.selectedMetas.length);
    return userSelections;
    
  } catch (error) {
    console.error('❌ Error saving meta selections:', error);
    throw error;
  }
}

/**
 * Save user's sample selections to database
 */
async function saveSampleSelections(tripId, userId, selectedSamples) {
  try {
    console.log('💾 Saving sample selections:', { tripId, userId, selectedSamples });
    
    // Find or create user selections
    let userSelections = await UserSelections.findOne({ tripId, userId });
    
    if (!userSelections) {
      userSelections = new UserSelections({
        tripId,
        userId,
        selectedMetas: [],
        selectedSamples: []
      });
    }
    
    // Update selected samples
    userSelections.selectedSamples = selectedSamples.map(sample => ({
      name: sample.name,
      type: sample.type,
      why_recommended: sample.why_recommended,
      selectedAt: new Date()
    }));
    
    await userSelections.save();
    
    console.log('✅ Sample selections saved:', userSelections.selectedSamples.length);
    return userSelections;
    
  } catch (error) {
    console.error('❌ Error saving sample selections:', error);
    throw error;
  }
}

/**
 * Get user's selections for a trip
 */
async function getUserSelections(tripId, userId) {
  try {
    const userSelections = await UserSelections.findOne({ tripId, userId });
    
    if (!userSelections) {
      return {
        selectedMetas: [],
        selectedSamples: [],
        behaviorData: {
          totalSelections: 0,
          metaPreferences: { art: 0, foodie: 0, adventure: 0, history: 0 },
          samplePreferences: { attraction: 0, restaurant: 0, neat_thing: 0 }
        }
      };
    }
    
    return userSelections;
    
  } catch (error) {
    console.error('❌ Error getting user selections:', error);
    throw error;
  }
}

/**
 * Get user's behavior patterns for prediction
 */
async function getUserBehaviorPatterns(userId) {
  try {
    const allSelections = await UserSelections.find({ userId });
    
    if (allSelections.length === 0) {
      return {
        totalTrips: 0,
        averageSelections: 0,
        preferredMetaTypes: {},
        preferredSampleTypes: {}
      };
    }
    
    // Aggregate behavior data
    const totalSelections = allSelections.reduce((sum, selection) => 
      sum + selection.behaviorData.totalSelections, 0
    );
    
    const averageSelections = totalSelections / allSelections.length;
    
    // Calculate preferred types
    const metaPrefs = allSelections.reduce((acc, selection) => {
      Object.keys(selection.behaviorData.metaPreferences).forEach(key => {
        acc[key] = (acc[key] || 0) + selection.behaviorData.metaPreferences[key];
      });
      return acc;
    }, {});
    
    const samplePrefs = allSelections.reduce((acc, selection) => {
      Object.keys(selection.behaviorData.samplePreferences).forEach(key => {
        acc[key] = (acc[key] || 0) + selection.behaviorData.samplePreferences[key];
      });
      return acc;
    }, {});
    
    return {
      totalTrips: allSelections.length,
      averageSelections,
      preferredMetaTypes: metaPrefs,
      preferredSampleTypes: samplePrefs,
      lastUpdated: new Date()
    };
    
  } catch (error) {
    console.error('❌ Error getting behavior patterns:', error);
    throw error;
  }
}

module.exports = {
  saveMetaSelections,
  saveSampleSelections,
  getUserSelections,
  getUserBehaviorPatterns
};
