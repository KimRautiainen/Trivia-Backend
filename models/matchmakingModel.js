const pool = require("../Db");
const promisePool = pool.promise();

// -- MATCHMAKINGPOOL OPERATIONS -- //

const addPlayerToMatchmakingPool = async (playerId, rankPoints) => {
  const sql = `INSERT INTO MatchmakingPool (playerId, rankPoints) VALUES (?, ?)`;
  await promisePool.query(sql, [playerId, rankPoints]);
};

const removePlayerFromMatchmakingPool = async (playerId) => {
  const sql = `DELETE FROM MatchmakingPool WHERE playerId = ?`;
  await promisePool.query(sql, [playerId]);
};

const fetchMatchmakingPool = async () => {
  const sql = `SELECT * FROM MatchmakingPool ORDER BY connectedAt`;
  const [rows] = await promisePool.query(sql);
  return rows;
};

// -- GAMESESSION OPERATIONS -- //

const createGameSession = async (player1Id, player2Id) => {
  const sql = `INSERT INTO GameSession (player1Id, player2Id, gameStatus) VALUES (?, ?, 'active')`;
  const [result] = await promisePool.query(sql, [player1Id, player2Id]);
  return result.insertId;
};

const getGameSessionById = async (sessionId) => {
  const sql = `SELECT * FROM GameSession WHERE sessionId = ?`;
  const [rows] = await promisePool.query(sql, [sessionId]);
  if (!rows.length) {
    throw new Error("Game session not found");
  }
  return rows[0];
};

const updateGameScore = async (sessionId, playerId, increment) => {
  try {
    // Get the game session to determine if playerId is player1 or player2
    const sqlGetSession = `SELECT player1Id, player2Id FROM GameSession WHERE sessionId = ?`;
    const [session] = await promisePool.query(sqlGetSession, [sessionId]);

    if (!session.length) {
      throw new Error("Game session not found");
    }

    const { player1Id, player2Id } = session[0];

    // Determine which player's score to update
    let scoreColumn;
    if (playerId === player1Id) {
      scoreColumn = "player1Score";
    } else if (playerId === player2Id) {
      scoreColumn = "player2Score";
    } else {
      throw new Error("Player does not belong to this game session");
    }

    // Update the correct score column
    const sqlUpdateScore = `UPDATE GameSession SET ${scoreColumn} = ${scoreColumn} + ? WHERE sessionId = ?`;
    await promisePool.query(sqlUpdateScore, [increment, sessionId]);
  } catch (error) {
    console.error("Failed to update game score:", error.message);
    throw error;
  }
};
const endGameSession = async (sessionId, winnerId) => {
  const sql = `UPDATE GameSession SET gameStatus = 'completed', winnerId = ? WHERE sessionId = ?`;
  await promisePool.query(sql, [winnerId, sessionId]);
};

// -- GAMEQUESTIONS OPERATIONS -- //

const saveQuestionsToGame = async (questions) => {
  const sql = `
    INSERT INTO GameQuestions (gameId, question, correctAnswer, options, category, difficulty, questionOrder)
    VALUES ?`;

  const values = questions.map((q) => [
    q.gameId,
    q.question,
    q.correctAnswer,
    JSON.stringify(q.options),
    q.category,
    q.difficulty,
    q.order,
  ]);

  await promisePool.query(sql, [values]);
};

const fetchQuestionsForGame = async (gameId) => {
  const sql = `SELECT * FROM GameQuestions WHERE gameId = ? ORDER BY questionOrder ASC`;
  const [rows] = await promisePool.query(sql, [gameId]);
  return rows;
};

const trackAnsweredQuestion = async (gameId, questionOrder, userId) => {
  const sql = `
    UPDATE GameQuestions 
    SET answeredBy = IF(answeredBy IS NULL, ?, CONCAT(answeredBy, ',', ?))
    WHERE gameId = ? AND questionOrder = ?`;
  await promisePool.query(sql, [userId, userId, gameId, questionOrder]);
};

const countAnsweredQuestions = async (gameId) => {
  const sql = `
    SELECT COUNT(*) AS answeredQuestions 
    FROM GameQuestions 
    WHERE gameId = ? AND answeredBy IS NOT NULL`;
  const [result] = await promisePool.query(sql, [gameId]);
  return result[0].answeredQuestions;
};

const countAnsweredQuestionsByUser = async (gameId, userId) => {
  const sql = `
    SELECT COUNT(*) AS answeredQuestions 
    FROM GameQuestions 
    WHERE gameId = ? AND FIND_IN_SET(?, answeredBy)`;
  const [rows] = await promisePool.query(sql, [gameId, userId]);
  return rows[0].answeredQuestions;
};

const countTotalQuestions = async (gameId) => {
  const sql = `
    SELECT COUNT(*) AS totalQuestions 
    FROM GameQuestions 
    WHERE gameId = ?`;
  const [result] = await promisePool.query(sql, [gameId]);
  return result[0].totalQuestions;
};
const getGameSessionByUserId = async (userId) => {
  const sql = `
    SELECT 
      sessionId,
      player1Id,
      player2Id,
      player1Score,
      player2Score,
      gameStatus,
      winnerId,
      startedAt
    FROM 
      GameSession
    WHERE 
      (player1Id = ? OR player2Id = ?) 
      AND gameStatus = 'active'
    LIMIT 1;
  `;

  try {
    const [rows] = await promisePool.query(sql, [userId, userId]);
    return rows.length > 0 ? rows[0] : null; // Return the first row if found, else null
  } catch (error) {
    console.error("Error fetching game session by user ID:", error.message);
    throw new Error("Database query failed");
  }
};

module.exports = {
  addPlayerToMatchmakingPool,
  removePlayerFromMatchmakingPool,
  fetchMatchmakingPool,
  createGameSession,
  getGameSessionById,
  updateGameScore,
  endGameSession,
  saveQuestionsToGame,
  fetchQuestionsForGame,
  trackAnsweredQuestion,
  countAnsweredQuestions,
  countTotalQuestions,
  countAnsweredQuestionsByUser,
  getGameSessionByUserId,
};
