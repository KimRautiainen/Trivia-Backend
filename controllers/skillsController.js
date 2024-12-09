const skillsModel = require('../models/skillsModel');

// Update or insert stats for a category
const updateStats = async (req, res) => {
    const { userId, category, isCorrect } = req.body;
  
    if (!userId || !category || typeof isCorrect !== 'boolean') {
      return res.status(400).json({ error: 'Missing required fields' });
    }
  
    try {
      await skillsModel.updateCategoryStats(userId, category, isCorrect);
      return res.status(200).json({ message: 'Stats updated successfully' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };
  
  // Get user stats for all categories
  const getStats = async (req, res) => {
    const { userId } = req.params;
  
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
  
    try {
      const stats = await skillsModel.getUserStats(userId);
      return res.status(200).json(stats);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };
  
  // Get top categories for a user
  const getTopCategories = async (req, res) => {
    const { userId } = req.params;
    const { limit } = req.query;
  
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
  
    try {
      const topCategories = await skillsModel.getTopCategories(userId, parseInt(limit, 10) || 3);
      return res.status(200).json(topCategories);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };
  
  module.exports = {
    updateStats,
    getStats,
    getTopCategories,
  };