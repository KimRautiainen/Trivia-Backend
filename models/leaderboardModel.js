"use strict";
const pool = require("../Db");
const promisePool = pool.promise();

// Leaderboard modules

const getLeaderboard = async () => {
  try {
    const sql = `SELECT * FROM LEADERBOARD ORDER BY SCORE DESC LIMIT 10`;
    const [rows] = await promisePool.query(sql);
    return rows;
  } catch (e) {
    console.error("error", e.message);
    throw new Error("sql query failed");
  }
};
const getLeaderboardById = async (id) => {
  try {
    const sql = `SELECT * FROM LEADERBOARD WHERE userId = ?`;
    const [rows] = await promisePool.query(sql, [id]);
    return rows;
  } catch (e) {
    console.error("error", e.message);
    throw new Error("sql query failed");
  }
};
module.exports = {
  getLeaderboard,
  getLeaderboardById,
};
