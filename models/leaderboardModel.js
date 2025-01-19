"use strict";
const pool = require("../Db");
const promisePool = pool.promise();

// -- Leaderboard modules -- //

// Get 10 highest score leaderboard entries from database 
const getLeaderboard = async () => {
  try {
    const sql = `SELECT * FROM Leaderboard ORDER BY score DESC LIMIT 10`;
    const [rows] = await promisePool.query(sql);
    return rows;
  } catch (e) {
    console.error("error", e.message);
    throw new Error("sql query failed");
  }
};

// Get leaderboard entries for user with user id
const getLeaderboardById = async (id) => {
  try {
    const sql = `SELECT * FROM Leaderboard WHERE userId = ?`;
    const [rows] = await promisePool.query(sql, [id]);
    return rows;
  } catch (e) {
    console.error("error", e.message);
    throw new Error("sql query failed");
  }
};

// Get leaderboard highscore entries for user for all gamemodes
const getHighscore = async (userId) => {
    try {
        const sql = `
            SELECT userId, gameId, MAX(score) as highscore
            FROM Leaderboard
            WHERE userId = ?
            GROUP BY gameId`;
        const [rows] = await promisePool.query(sql, [userId]);
        return rows;
    } catch (e) {
        console.error("error", e.message);
        throw new Error("sql query failed");
    }
};
// Update users highscore 
const updateHighscore = async (userId, gameId, newScore) => {
    try {
        // Check if a record with the same userId and gameId exists
        const checkSql = 'SELECT score FROM Leaderboard WHERE userId = ? AND gameId = ?';
        const [checkRows] = await promisePool.query(checkSql, [userId, gameId]);

        if (checkRows.length === 0 || newScore > checkRows[0].score) {
            // If no record exists or newScore is higher, insert or update the score
            const currentDate = new Date();
            const formattedDate = currentDate.toISOString().split('T')[0];

            if (checkRows.length === 0) {
                // Insert a new score if no record exists
                const insertSql = `
                    INSERT INTO Leaderboard (userId, gameId, score, rankingDate)
                    VALUES (?, ?, ?, ?)`;
                const [insertRows] = await promisePool.query(insertSql, [userId, gameId, newScore, formattedDate]);
                return insertRows;
            } else {
                // Update the score if newScore is higher
                const updateSql = `
                    UPDATE Leaderboard
                    SET score = ?, rankingDate = ?
                    WHERE userId = ? AND gameId = ?`;
                const [updateRows] = await promisePool.query(updateSql, [newScore, formattedDate, userId, gameId]);
                return updateRows;
            }
        } else {
            // If existing score is equal or higher, no update is needed
            return { message: 'Score not updated because it is not higher than the existing score.' };
        }
    } catch (e) {
        console.error("error", e.message);
        throw new Error("sql query failed");
    }
};


module.exports = {
  getLeaderboard,
  getLeaderboardById,
  getHighscore,
  updateHighscore,
};
