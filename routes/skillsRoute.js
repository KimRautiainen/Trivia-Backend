const express = require('express');
const router = express.Router();
const skillsController = require('../controllers/skillsController');

// Update stats for a category
router.post('/update', skillsController.updateStats);

// Get user stats for all categories
router.get('/:userId', skillsController.getStats);

// Get top categories for a user
router.get('/:userId/top', skillsController.getTopCategories);

module.exports = router;