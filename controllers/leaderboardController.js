"use strict";
const e = require("express");
const leaderboardModel = require("../models/leaderboardModel");
const { validationResult } = require("express-validator");
// Leaderboard controlling
const getLeaderboard = async (req, res) => {
  const errors = validationResult(req);
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
const updateHighscore = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array() });
  }
    try {
        const userId = req.params.userId;
        const gameId = req.body.gameId;
        const score = req.body.score;
        const highscore = await leaderboardModel.updateHighscore(userId, gameId, score);
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
