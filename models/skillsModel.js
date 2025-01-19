"use strict";
const pool = require("../Db");
const promisePool = pool.promise();
// -- Model for all skills of user. Skills are correct / incorrect answer ratio of a category, showcasing how good user is in that category

// Update or insert stats for a category
const updateCategoryStats = async (userId, category, isCorrect) => {
  try {
    const sql = `
        INSERT INTO UserGameStats (userId, category, correctAnswers, wrongAnswers)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          correctAnswers = correctAnswers + VALUES(correctAnswers),
          wrongAnswers = wrongAnswers + VALUES(wrongAnswers);
      `;
    const [result] = await promisePool.query(sql, [
      userId,
      category,
      isCorrect ? 1 : 0, // Increment correctAnswers if correct
      isCorrect ? 0 : 1, // Increment wrongAnswers if incorrect
    ]);
    return result;
  } catch (error) {
    throw new Error(`Failed to update stats: ${error.message}`);
  }
};

// Get user stats for all categories
const getUserStats = async (userId) => {
  try {
    const sql = `
        SELECT category, correctAnswers, wrongAnswers, totalQuestions, skillLevel
        FROM UserGameStats
        WHERE userId = ?;
      `;
    const [rows] = await promisePool.query(sql, [userId]);
    return rows;
  } catch (error) {
    throw new Error(`Failed to get user stats: ${error.message}`);
  }
};

// Get top categories for a user
const getTopCategories = async (userId, limit = 3) => {
  try {
    const sql = `
        SELECT category, skillLevel
        FROM UserGameStats
        WHERE userId = ?
        ORDER BY skillLevel DESC
        LIMIT ?;
      `;
    const [rows] = await promisePool.query(sql, [userId, limit]);
    return rows;
  } catch (error) {
    throw new Error(`Failed to get top categories: ${error.message}`);
  }
};

module.exports = {
  updateCategoryStats,
  getUserStats,
  getTopCategories,
};
