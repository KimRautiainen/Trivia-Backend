"use strict";
const express = require("express");
const router = express.Router();
const authorizeUser = require("../middleware/authMiddleware");
const leaderboardController = require("../controllers/leaderboardController");
const passport = require("passport");

// Leaderboard routes
router.route("/getLeaderboard").get(leaderboardController.getLeaderboard);

// Get leaderboard by id
router.get(
  "/getLeaderboardById/:userId",
  leaderboardController.getLeaderboardById
);

// get current highscore of user
router.get(
  "/getHighscore/:userId",
  leaderboardController.getHighscore
);

// update highscore
router.put(
    "/updateHighscore/:userId",
    passport.authenticate('jwt', { session: false }),
    authorizeUser,
    leaderboardController.updateHighscore
  );

module.exports = router;
