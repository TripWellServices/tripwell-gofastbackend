      const ActivityService = require('../services/GoFast/ActivityService');

      const logActivity = async (req, res) => {
        try {
          const { userId, activityDate, distance, avgPace, avgHeartRate, elevationGain, workoutType, source } = req.body;
          const activity = await ActivityService.logActivity(userId, { activityDate, distance, avgPace, avgHeartRate, elevationGain, workoutType, source });
          res.json(activity);
        } catch (error) {
          res.status(500).json({ message: error.message });
        }
      };

      const getActivitiesForUser = async (req, res) => {
        try {
          const { userId } = req.params;
          const activities = await ActivityService.getActivitiesForUser(userId);
          res.json(activities);
        } catch (error) {
          res.status(500).json({ message: error.message });
        }
      };

      // ✅ THIS MUST BE AT THE END
      module.exports = { logActivity, getActivitiesForUser };
