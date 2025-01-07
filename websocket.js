const WebSocket = require("ws");
const jwt = require("jsonwebtoken");
const matchmakingPool = [];
const activeGames = {};
const { updateHighscore } = require("./models/leaderboardModel");
const {
  addPlayerToMatchmakingPool,
  removePlayerFromMatchmakingPool,
  fetchMatchmakingPool,
  createGameSession,
  getGameSessionById,
  updateGameScore,
  endGameSession,
  saveQuestionsToGame,
  fetchQuestionsForGame,
  countAnsweredQuestionsByUser,
  countTotalQuestions,
  trackAnsweredQuestion,
} = require("./models/matchmakingModel");
const axios = require("axios");

const webSocketMap = new Map(); // Maps userId to WebSocket connection

const initializeWebSocket = (server) => {
  const wss = new WebSocket.Server({
    server,
    verifyClient: (info, done) => {
      try {
        const token = info.req.headers["sec-websocket-protocol"];
        if (!token) {
          throw new Error("No token provided");
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        info.req.user = decoded; // Attach user information to the request
        done(true);
      } catch (err) {
        console.error("WebSocket authentication failed:", err.message);
        done(false, 401, "Unauthorized");
      }
    },
  });

  wss.on("connection", (ws, req) => {
    const user = req.user; // Extract user info from the request
    console.log("Player connected:", user.userId);

    // Add WebSocket connection to the map
    webSocketMap.set(user.userId, ws);

    ws.on("message", (message) => {
      const data = JSON.parse(message);
      handleWebSocketMessage(ws, data, user); // Pass user info to handlers
    });

    ws.on("close", () => {
      console.log("Player disconnected");
      webSocketMap.delete(user.userId); // Remove from WebSocket map
      handleDisconnect(ws, user.userId);
    });
  });

  console.log("WebSocket server initialized");
};

// Helper function to extract token from the request
const getTokenFromRequest = (req) => {
  const authHeader = req.headers["sec-websocket-protocol"];
  if (!authHeader) {
    throw new Error("No token provided");
  }
  return authHeader;
};

const handleWebSocketMessage = async (ws, data, user) => {
  switch (data.type) {
    case "join_matchmaking":
      await handleJoinMatchmaking(ws, user.userId, user.rankPoints);
      break;
    case "answer_question":
      await handleAnswerQuestion(data.payload, user.userId);
      break;
    case "end_match":
      await handleEndMatch(data.payload.gameId);
      break;
    case "leave_matchmaking":
      await handleLeaveMatchmaking(user.userId);
      break;
    default:
      console.log("Unknown message type:", data.type);
  }
};

const handleJoinMatchmaking = async (ws, userId, rankPoints) => {
  try {
    await addPlayerToMatchmakingPool(userId, rankPoints);
    console.log(`User ${userId} joined matchmaking`);

    const pool = await fetchMatchmakingPool();
    console.log("Matchmaking pool:", pool); // Debugging log
    await attemptMatch(pool);
  } catch (error) {
    console.error("Error joining matchmaking:", error.message);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: "error",
          payload: { message: "Failed to join matchmaking." },
        })
      );
    }
  }
};

const attemptMatch = async (pool) => {
  try {
    if (pool.length < 2) return;

    const [player1, player2] = pool.slice(0, 2);

    if (Math.abs(player1.rankPoints - player2.rankPoints) > 200) return;

    await Promise.all([
      removePlayerFromMatchmakingPool(player1.playerId),
      removePlayerFromMatchmakingPool(player2.playerId),
    ]);

    const gameId = await createGameSession(player1.playerId, player2.playerId);

    // Fetch and save questions for the match
    const questions = await generateQuestionsForGame(gameId);

    // Retrieve WebSocket connections
    const player1Ws = webSocketMap.get(player1.playerId);
    const player2Ws = webSocketMap.get(player2.playerId);

    // Notify players
    if (player1Ws && player1Ws.readyState === WebSocket.OPEN) {
      player1Ws.send(
        JSON.stringify({
          type: "match_found",
          payload: { gameId, opponent: player2.playerId, questions },
        })
      );
    }

    if (player2Ws && player2Ws.readyState === WebSocket.OPEN) {
      player2Ws.send(
        JSON.stringify({
          type: "match_found",
          payload: { gameId, opponent: player1.playerId, questions },
        })
      );
    }

    console.log(`Match created: ${player1.playerId} vs ${player2.playerId}`);
  } catch (error) {
    console.error("Error matching players:", error.message);
  }
};

const generateQuestionsForGame = async (gameId, questionCount = 10) => {
  try {
    // Fetch questions from the Trivia API
    const response = await axios.get(
      "https://the-trivia-api.com/v2/questions",
      {
        params: { limit: questionCount },
      }
    );

    const questions = response.data;

    // Map the questions to a format that includes the gameId and order
    const mappedQuestions = questions.map((q, index) => ({
      gameId,
      question: q.question.text,
      correctAnswer: q.correctAnswer,
      incorrectAnswers: q.incorrectAnswers,
      options: [...q.incorrectAnswers, q.correctAnswer].sort(
        () => Math.random() - 0.5
      ), // Randomize options
      category: q.category,
      difficulty: q.difficulty,
      order: index,
    }));

    // Save questions to your database (e.g., GameQuestions table)
    await saveQuestionsToGame(mappedQuestions);

    return mappedQuestions;
  } catch (error) {
    console.error(
      "Error fetching questions from the Trivia API:",
      error.message
    );
    throw new Error("Failed to generate questions for the game.");
  }
};

const handleAnswerQuestion = async (
  { gameId, questionOrder, answer },
  userId
) => {
  try {
    // Fetch questions for the game
    const gameQuestions = await fetchQuestionsForGame(gameId);

    // Find the specific question
    const question = gameQuestions.find((q) => q.order === questionOrder);
    if (!question) {
      throw new Error("Question not found");
    }

    // Check if the answer is correct
    const isCorrect = question.correctAnswer === answer;

    // Update game score
    await updateGameScore(gameId, userId, isCorrect ? 1 : 0);

    // Track the answered question
    await trackAnsweredQuestion(gameId, questionOrder, userId);

    // Fetch the updated game session
    const game = await getGameSessionById(gameId);
    const player1Ws = webSocketMap.get(game.player1Id);
    const player2Ws = webSocketMap.get(game.player2Id);

    // Send feedback to both players
    const feedbackMessage = JSON.stringify({
      type: "answer_feedback",
      payload: {
        userId,
        questionOrder,
        isCorrect,
        correctAnswer: question.correctAnswer,
      },
    });

    if (player1Ws && player1Ws.readyState === WebSocket.OPEN) {
      player1Ws.send(feedbackMessage);
    }
    if (player2Ws && player2Ws.readyState === WebSocket.OPEN) {
      player2Ws.send(feedbackMessage);
    }

    console.log(
      `User ${userId} answered question ${questionOrder} in game ${gameId}. Correct: ${isCorrect}`
    );

    // Broadcast updated scores
    const scoresMessage = JSON.stringify({
      type: "score_update",
      payload: {
        gameId,
        scores: {
          player1Score: game.player1Score,
          player2Score: game.player2Score,
        },
      },
    });

    if (player1Ws && player1Ws.readyState === WebSocket.OPEN) {
      player1Ws.send(scoresMessage);
    }
    if (player2Ws && player2Ws.readyState === WebSocket.OPEN) {
      player2Ws.send(scoresMessage);
    }

    // Count answered questions for each player
    const player1Answered = await countAnsweredQuestionsByUser(
      gameId,
      game.player1Id
    );
    const player2Answered = await countAnsweredQuestionsByUser(
      gameId,
      game.player2Id
    );

    const totalQuestions = await countTotalQuestions(gameId);

    // If both players have answered the current question, move to the next one
    if (player1Answered + player2Answered === 2 * (questionOrder + 1)) {
      const nextQuestion = gameQuestions.find(
        (q) => q.order === questionOrder + 1
      );

      if (nextQuestion) {
        const nextQuestionMessage = JSON.stringify({
          type: "next_question",
          payload: {
            question: nextQuestion,
          },
        });

        if (player1Ws && player1Ws.readyState === WebSocket.OPEN) {
          player1Ws.send(nextQuestionMessage);
        }
        if (player2Ws && player2Ws.readyState === WebSocket.OPEN) {
          player2Ws.send(nextQuestionMessage);
        }
      } else {
        console.log("No more questions. Ending match.");
        await handleEndMatch(gameId);
      }
    }
  } catch (error) {
    console.error("Error handling answer question:", error.message);
  }
};

const handleEndMatch = async (gameId) => {
  try {
    const game = await getGameSessionById(gameId);
    if (!game) {
      console.error("Game session not found:", gameId);
      return;
    }

    const { player1Id, player2Id, player1Score, player2Score } = game;

    let winnerId = null;
    if (player1Score > player2Score) {
      winnerId = player1Id;
    } else if (player2Score > player1Score) {
      winnerId = player2Id;
    }

    // Update game session status and winner
    await endGameSession(gameId, winnerId);

    // Update high scores
    await updateHighscore(player1Id, gameId, player1Score);
    await updateHighscore(player2Id, gameId, player2Score);

    // Notify players
    const player1Ws = webSocketMap.get(player1Id);
    const player2Ws = webSocketMap.get(player2Id);

    if (player1Ws && player1Ws.readyState === WebSocket.OPEN) {
      player1Ws.send(
        JSON.stringify({
          type: "game_ended",
          payload: {
            gameId,
            winner: winnerId,
            scores: { player1Score, player2Score },
          },
        })
      );
    }

    if (player2Ws && player2Ws.readyState === WebSocket.OPEN) {
      player2Ws.send(
        JSON.stringify({
          type: "game_ended",
          payload: {
            gameId,
            winner: winnerId,
            scores: { player1Score, player2Score },
          },
        })
      );
    }

    console.log(`Game ${gameId} ended. Winner: ${winnerId}`);
  } catch (error) {
    console.error("Error ending match:", error.message);
  }
};

const handleLeaveMatchmaking = async (userId) => {
  try {
    await removePlayerFromMatchmakingPool(userId);
    console.log(`User ${userId} left matchmaking`);
  } catch (error) {
    console.error("Error leaving matchmaking:", error.message);
  }
};

// TODO: Handle disconnect and try to connect user back to match and after x amount of time handle leave matchmaking
const handleDisconnect = async (ws, userId) => {
  try {
    await handleLeaveMatchmaking(userId);
    console.log(`User ${userId} disconnected`);
  } catch (error) {
    console.error("Error handling disconnect:", error.message);
  }
};

module.exports = { initializeWebSocket };
