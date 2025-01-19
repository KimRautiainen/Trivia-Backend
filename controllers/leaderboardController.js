"use strict";
const e = require("express");
const leaderboardModel = require("../models/leaderboardModel");
const { validationResult } = require("express-validator");

// -- Leaderboard controlling -- //

// Get all leaderboards
const getLeaderboard = async (req, res) => {
  const errors = validationResult(req); // Check validation results
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array() });
  }
  try {
    const leaderboard = await leaderboardModel.getLeaderboard();
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Get leaderboard with user id
const getLeaderboardById = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array() });
  }
  try {
    const userId = req.params.userId;
    const leaderboard = await leaderboardModel.getLeaderboardById(userId);
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Get user highscore from leaderboard with userId
const getHighscore = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array() });
  }
  try {
    const userId = req.params.userId;
    const highscore = await leaderboardModel.getHighscore(userId);
    res.json(highscore);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Update users highscore 
const updateHighscore = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array() });
  }
  try {
    const userId = req.params.userId; // User id from params
    const gameId = req.body.gameId; // game id from req.body
    const score = req.body.score; // score from req.body
    const highscore = await leaderboardModel.updateHighscore(
      userId,
      gameId,
      score
    );
    res.json(highscore);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const leaderboardController = {
  getLeaderboard,
  getLeaderboardById,
  getHighscore,
  updateHighscore,
};
module.exports = leaderboardController;
