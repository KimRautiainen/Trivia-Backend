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
  updateGameScore,
  endGameSession,
} = require("./models/matchmakingModel");

const webSocketMap = new Map(); // Maps userId to WebSocket connection

const initializeWebSocket = (server) => {
  const wss = new WebSocket.Server({
    server,
    verifyClient: (info, done) => {
      try {
        const token = getTokenFromRequest(info.req);
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

    // Ensure players are close in rank
    if (Math.abs(player1.rankPoints - player2.rankPoints) > 200) return;

    await Promise.all([
      removePlayerFromMatchmakingPool(player1.playerId),
      removePlayerFromMatchmakingPool(player2.playerId),
    ]);

    const gameId = await createGameSession(player1.playerId, player2.playerId);

    // Retrieve WebSocket connections
    const player1Ws = webSocketMap.get(player1.playerId);
    const player2Ws = webSocketMap.get(player2.playerId);

    if (!player1Ws || !player2Ws) {
      console.error("WebSocket connection missing for one of the players.");
      return;
    }

    // Notify players
    if (player1Ws.readyState === WebSocket.OPEN) {
      player1Ws.send(
        JSON.stringify({
          type: "match_found",
          payload: { gameId, opponent: player2.playerId },
        })
      );
    }
    if (player2Ws.readyState === WebSocket.OPEN) {
      player2Ws.send(
        JSON.stringify({
          type: "match_found",
          payload: { gameId, opponent: player1.playerId },
        })
      );
    }

    console.log(`Match created: ${player1.playerId} vs ${player2.playerId}`);
  } catch (error) {
    console.error("Error matching players:", error.message);
  }
};

const handleAnswerQuestion = async ({ gameId, isCorrect }, userId) => {
  try {
    const increment = isCorrect ? 1 : 0;
    await updateGameScore(gameId, userId, increment);

    console.log(`Updated score for user ${userId} in game ${gameId}`);
  } catch (error) {
    console.error("Error handling answer question:", error.message);
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

const handleDisconnect = async (ws, userId) => {
  try {
    await handleLeaveMatchmaking(userId);
    console.log(`User ${userId} disconnected`);
  } catch (error) {
    console.error("Error handling disconnect:", error.message);
  }
};

module.exports = { initializeWebSocket };
