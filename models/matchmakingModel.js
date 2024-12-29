const pool = require("../Db");
const promisePool = pool.promise();

// MatchmakingPool operations
const addPlayerToMatchmakingPool = async (playerId, rankPoints) => {
  try {
    const sql = `INSERT INTO MatchmakingPool (playerId, rankPoints) VALUES (?, ?)`;
    await promisePool.query(sql, [playerId, rankPoints]);
  } catch (error) {
    console.error("Failed to add player to matchmaking pool:", error.message);
  }
};

const removePlayerFromMatchmakingPool = async (playerId) => {
  try {
    const sql = `DELETE FROM MatchmakingPool WHERE playerId = ?`;
    await promisePool.query(sql, [playerId]);
  } catch (error) {
    console.error("Failed to remove player from matchmaking pool:", error.message);
  }
};

const fetchMatchmakingPool = async () => {
  try {
    const sql = `SELECT * FROM MatchmakingPool ORDER BY connectedAt`;
    const [rows] = await promisePool.query(sql);
    return rows;
  } catch (error) {
    console.error("Failed to fetch matchmaking pool:", error.message);
    return [];
  }
};

// GameSession operations
const createGameSession = async (player1Id, player2Id) => {
  try {
    const sql = `INSERT INTO GameSession (player1Id, player2Id, gameStatus) VALUES (?, ?, 'active')`;
    const [result] = await promisePool.query(sql, [player1Id, player2Id]);
    return result.insertId;
  } catch (error) {
    console.error("Failed to create game session:", error.message);
    throw error;
  }
};

const updateGameScore = async (sessionId, playerId, newScore) => {
  try {
    const scoreColumn = `player${playerId === 1 ? "1" : "2"}Score`;
    const sql = `UPDATE GameSession SET ${scoreColumn} = ? WHERE sessionId = ?`;
    await promisePool.query(sql, [newScore, sessionId]);
  } catch (error) {
    console.error("Failed to update game score:", error.message);
  }
};

const endGameSession = async (sessionId, winnerId) => {
  try {
    const sql = `UPDATE GameSession SET gameStatus = 'completed', winnerId = ? WHERE sessionId = ?`;
    await promisePool.query(sql, [winnerId, sessionId]);
  } catch (error) {
    console.error("Failed to end game session:", error.message);
  }
};
module.exports = {
  addPlayerToMatchmakingPool,
  removePlayerFromMatchmakingPool,
  fetchMatchmakingPool,
  createGameSession,
  updateGameScore,
  endGameSession,
};
