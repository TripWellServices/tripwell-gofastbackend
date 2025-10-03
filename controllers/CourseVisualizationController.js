
const { generateCourseVisualization } = require('../services/Archive/CourseVisualizationService');

const visualizeCourse = async (req, res) => {
  try {
    const { raceName } = req.body;
    if (!raceName) return res.status(400).json({ error: 'raceName is required' });

    const profile = await generateCourseVisualization(raceName);
    res.status(200).json(profile);
  } catch (err) {
    console.error('Error generating course visualization:', err);
    res.status(500).json({ error: 'Failed to generate course profile' });
  }
};

module.exports = { visualizeCourse };