"use strict";
const express = require("express");
const router = express.Router();
const authorizeUser = require("../middleware/authMiddleware");
const leaderboardController = require("../controllers/leaderboardController");

// Leaderboard routes
router.route("/getLeaderboard").get(leaderboardController.getLeaderboard);

// Get leaderboard by id
router.get(
  "/getLeaderboardById/:userId",
  leaderboardController.getLeaderboardById
);
module.exports = router;
