const WebSocket = require("ws");
const jwt = require("jsonwebtoken");
const matchmakingPool = []; // Pool of players waiting for matchmaking
const activeGames = {}; // Active games being tracked
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
  getGameSessionByUserId,
} = require("./models/matchmakingModel");
const axios = require("axios");

const webSocketMap = new Map(); // Maps userId to WebSocket connection
const disconnectTimeouts = new Map(); // To track disconnection timeouts

// Initialize WebSocket server
const initializeWebSocket = (server) => {
  const wss = new WebSocket.Server({
    server,
    verifyClient: (info, done) => {
      try {
        // Extract and verify the JWT token from headers
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
    console.log("user from req.user: ", user);

    // Add WebSocket connection to the map
    webSocketMap.set(user.userId, ws);

    // Handle reconnection if applicable
    handleReconnect(ws, user.userId);

    // Listen for incoming messages from the client
    ws.on("message", (message) => {
      const data = JSON.parse(message);
      handleWebSocketMessage(ws, data, user); // Pass user info to handlers
    });

    // Handle WebSocket disconnection
    ws.on("close", () => {
      console.log("Player disconnected");
      webSocketMap.delete(user.userId); // Remove from WebSocket map
      handleDisconnect(ws, user.userId);
    });
  });

  console.log("WebSocket server initialized");
};

// Extract the JWT token from the WebSocket request headers
const getTokenFromRequest = (req) => {
  const authHeader = req.headers["sec-websocket-protocol"];
  if (!authHeader) {
    throw new Error("No token provided");
  }
  return authHeader;
};

// Handle incoming WebSocket messages based on their type
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

// Add the player to the matchmaking pool and attempt to find a match
const handleJoinMatchmaking = async (ws, userId, rankPoints) => {
  try {
    await addPlayerToMatchmakingPool(userId, rankPoints);
    console.log(`User ${userId} joined matchmaking`);

    const pool = await fetchMatchmakingPool(); // Get the current pool of players
    console.log("Matchmaking pool:", pool); // Debugging log
    await attemptMatch(pool); // Try to create a match
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

// Attempt to match players from the matchmaking pool
const attemptMatch = async (pool) => {
  try {
    if (pool.length < 2) return; // Need at least two players to create a match

    const [player1, player2] = pool.slice(0, 2);

    // Ensure players have similar rank points
    if (Math.abs(player1.rankPoints - player2.rankPoints) > 200) return;

    // Remove matched players from the pool
    await Promise.all([
      removePlayerFromMatchmakingPool(player1.playerId),
      removePlayerFromMatchmakingPool(player2.playerId),
    ]);

    // Create a new game session
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

// Generate trivia questions for the game session
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
// Handle a player's answer to a question
const handleAnswerQuestion = async (
  { gameId, questionOrder, answer },
  userId
) => {
  try {
    // Fetch questions for the game
    const gameQuestions = await fetchQuestionsForGame(gameId);

    // Find the specific question
    const question = gameQuestions.find(
      (q) => q.questionOrder === questionOrder
    );
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
          player1Id: game.player1Id,
          player2Id: game.player2Id,
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
        (q) => q.questionOrder === questionOrder + 1
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

// Handle ending match
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

// Handle when user leaves a match
const handleLeaveMatchmaking = async (userId) => {
  try {
    await removePlayerFromMatchmakingPool(userId); // Remove player from matchmaking pool
    console.log(`User ${userId} left matchmaking`);
  } catch (error) {
    console.error("Error leaving matchmaking:", error.message);
  }
};

// Handle user disconnection
const handleDisconnect = async (ws, userId) => {
  try {
    const game = await getGameSessionByUserId(userId); // Fetch the game session the user is in
    if (!game) {
      console.log(`User ${userId} disconnected but no active game.`);
      await handleLeaveMatchmaking(userId); // Remove from matchmaking pool
      return;
    }

    const { player1Id, player2Id } = game;
    const opponentId = player1Id === userId ? player2Id : player1Id;

    console.log(
      `User ${userId} disconnected. Notifying opponent (${opponentId}).`
    );

    const opponentWs = webSocketMap.get(opponentId);
    if (opponentWs && opponentWs.readyState === WebSocket.OPEN) {
      opponentWs.send(
        JSON.stringify({
          type: "player_disconnected",
          payload: { opponentId: userId },
        })
      );
    }

    // Start a timer to wait for the disconnected user to reconnect
    const timeout = setTimeout(async () => {
      console.log(
        `User ${userId} did not reconnect. Ending game ${game.gameId}.`
      );

      // End the game and declare the opponent as the winner
      const winnerId = opponentId;
      await endGameSession(game.gameId, winnerId);

      if (opponentWs && opponentWs.readyState === WebSocket.OPEN) {
        opponentWs.send(
          JSON.stringify({
            type: "game_ended",
            payload: {
              gameId: game.gameId,
              winner: winnerId,
              scores: {
                player1Score: game.player1Score,
                player2Score: game.player2Score,
              },
            },
          })
        );
      }

      webSocketMap.delete(userId); // Remove disconnected user from map
    }, 30000); // Wait 30 seconds

    disconnectTimeouts.set(userId, timeout);
  } catch (error) {
    console.error("Error handling disconnect:", error.message);
  }
};

// Handle user reconnection to the WebSocket server
const handleReconnect = async (ws, userId) => {
  try {
    // Check if the user has an active disconnection timeout
    if (disconnectTimeouts.has(userId)) {
      // Clear the disconnection timeout as the user has reconnected
      clearTimeout(disconnectTimeouts.get(userId));
      disconnectTimeouts.delete(userId);

      console.log(`User ${userId} reconnected.`);

      // Retrieve the game session associated with the user
      const game = await getGameSessionByUserId(userId);

      if (game) {
        // Identify the opponent's user ID
        const opponentId =
          game.player1Id === userId ? game.player2Id : game.player1Id;

        // Fetch the WebSocket connection for the opponent
        const opponentWs = webSocketMap.get(opponentId);

        // Notify the opponent about the user's reconnection if they are online
        if (opponentWs && opponentWs.readyState === WebSocket.OPEN) {
          opponentWs.send(
            JSON.stringify({
              type: "player_reconnected",
              payload: { opponentId: userId },
            })
          );
        }
      }
    } else {
      console.log(`User ${userId} reconnected but no active disconnection.`);
    }
  } catch (error) {
    // Log any errors encountered during the reconnection handling
    console.error("Error handling reconnect:", error.message);
  }
};

module.exports = { initializeWebSocket };
