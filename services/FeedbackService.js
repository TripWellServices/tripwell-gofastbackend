const Feedback = require('../../models/Feedback');

const logFeedback = async (userId, feedbackData) => {
  return await Feedback.create({ userId, ...feedbackData });
};

const getFeedbackForUser = async (userId) => {
  return await Feedback.find({ userId }).sort({ weekStartDate: -1 });
};

module.exports = { logFeedback, getFeedbackForUser };
