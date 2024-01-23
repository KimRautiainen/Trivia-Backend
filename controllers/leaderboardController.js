"use strict";
const e = require("express");
const leaderboardModel = require("../models/leaderboardModel");
// Leaderboard controlling
const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await leaderboardModel.getLeaderboard();
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getLeaderboardById = async (req, res) => {
  try {
    const userId = req.params.userId;
    const leaderboard = await leaderboardModel.getLeaderboardById(userId);
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const leaderboardController = {
  getLeaderboard,
  getLeaderboardById,
};
module.exports = leaderboardController;
