"use strict";
const express = require("express");
const router = express.Router();
const authorizeUser = require("../middleware/authMiddleware");
const leaderboardController = require("../controllers/leaderboardController");
const passport = require("passport");
const { param, body } = require("express-validator");
// Validate userId as an integer
const validateUserId = param('userId', 'Invalid user ID').isInt().toInt();

// Validate gameId and score for updating highscores
const validateGameId = body('gameId', 'Invalid game ID').isInt();
const validateScore = body('score', 'Invalid score').isInt();

// Leaderboard routes with validation
router.get("/getLeaderboard", leaderboardController.getLeaderboard);

// Get leaderboard by id with userId validation
router.get("/getLeaderboardById/:userId", validateUserId, leaderboardController.getLeaderboardById);

// get current highscore of user with userId validation
router.get("/getHighscore/:userId", validateUserId, leaderboardController.getHighscore);

// update highscore with userId validation and additional body validations
router.put(
  "/updateHighscore/:userId",
  [passport.authenticate('jwt', { session: false }), authorizeUser, validateUserId, validateGameId, validateScore],
  leaderboardController.updateHighscore
);

module.exports = router;
