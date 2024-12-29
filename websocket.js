const WebSocket = require("ws");
const jwt = require("jsonwebtoken");
const matchmakingPool = [];
const activeGames = {};
const { updateHighscore } = require("./models/leaderboardModel");

const initializeWebSocket = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    console.log("Player connected");

    ws.on("message", (message) => {
      const data = JSON.parse(message);
      handleWebSocketMessage(ws, data);
    });

    ws.on("close", () => {
      console.log("Player disconnected");
      handleDisconnect(ws);
    });
  });

  console.log("WebSocket server initialized");
};

const handleWebSocketMessage = (ws, data) => {
  switch (data.type) {
    case "join_matchmaking":
      handleJoinMatchmaking(ws, data.payload);
      break;
    case "answer_question":
      handleAnswerQuestion(ws, data.payload);
      break;
    case "leave_matchmaking":
      handleLeaveMatchmaking(ws, data.payload);
    default:
      console.log("uknown message type :", data.type);
  }
};

const handleJoinMatchmaking = (ws, { userId, rankPoints }) => {
  matchmakingPool.push({ ws, userId, rankPoints });

  console.log(`User ${userId} joined matchmaking`);
  attemptMatch();
};

const attemptMatch = () => {
  matchmakingPool.sort((a, b) => a.rankPoints - b.rankPoints);

  for (let i = 0; i < matchmakingPool.length - 1; i++) {
    const player1 = matchmakingPool[i];
    const player2 = matchmakingPool[i + 1];

    if (Math.abs(player1.rankPoints - player2.rankPoints) <= 100) {
      matchmakingPool.splice(i, 2); // Remove matched players

      const gameId = `game-${Date.now()}`;
      activeGames[gameId] = {
        player1,
        player2,
        state: "IN_PROGRESS",
        scores: {
          [player1.userId]: 0,
          [player2.userId]: 0,
        },
        timer: setTimeout(() => endMatch(gameId), 300000), // 5-minute timer
      };

      player1.ws.send(
        JSON.stringify({
          type: "match_found",
          payload: { gameId, opponent: player2.userId },
        })
      );
      player2.ws.send(
        JSON.stringify({
          type: "match_found",
          payload: { gameId, opponent: player1.userId },
        })
      );

      console.log(`Match created: ${player1.userId} vs ${player2.userId}`);
      break;
    }
  }
};

const endMatch = async (gameId) => {
  const game = activeGames[gameId];
  if (!game) return;

  const winner =
    game.scores[game.player1.userId] > game.scores[game.player2.userId]
      ? game.player1.userId
      : game.scores[game.player1.userId] < game.scores[game.player2.userId]
      ? game.player2.userId
      : "DRAW";

  // Update the leaderboard
  const gameIdForLeaderboard = 1;
  try {
    await updateHighscore(
      player1.userId,
      gameIdForLeaderboard,
      scores[player1.userId]
    );
    await updateHighscore(
      player2.userId,
      gameIdForLeaderboard,
      scores[player2.userId]
    );
    console.log("Leaderboard updated for both players");
  } catch (e) {
    console.error("Failed to update leaderboard:", e.message);
  }
  // Notify players
  game.player1.ws.send(
    JSON.stringify({
      type: "game_ended",
      payload: { winner, scores: game.scores },
    })
  );
  game.player2.ws.send(
    JSON.stringify({
      type: "game_ended",
      payload: { winner, scores: game.scores },
    })
  );

  // Cleanup
  clearTimeout(game.timer);
  delete activeGames[gameId];
  console.log(`Game ${gameId} ended. Winner: ${winner}`);
};

const handleAnswerQuestion = (ws, { gameId, userId, isCorrect }) => {
  const game = activeGames[gameId];
  if (!game) return;

  if (isCorrect) {
    game.scores[userId] += 1;
  }

  game.player1.ws.send(
    JSON.stringify({
      type: "update_score",
      payload: { userId, score: game.scores[userId] },
    })
  );
  game.player2.ws.send(
    JSON.stringify({
      type: "update_score",
      payload: { userId, score: game.scores[userId] },
    })
  );
  console.log(`User ${userId} answered a question in game ${gameId}`);
};

const handleLeaveMatchmaking = (ws) => {
  const index = matchmakingPool.findIndex((player) => player.ws === ws);
  if (index !== -1) {
    const [removed] = matchmakingPool.splice(index, 1);
    ws.send(
      JSON.stringify({
        type: "matchmaking_cancelled",
        payload: { message: "You have left matchmaking." },
      })
    );
    console.log(`User ${removed.userId} left matchmaking`);
  }
};

const handleDisconnect = (ws) => {
  handleLeaveMatchmaking(ws);

  for (const [gameId, game] of Object.entries(activeGames)) {
    if (game.player1.ws === ws || game.player2.ws === ws) {
      console.log(`User disconnected from game ${gameId}`);
      const opponent = game.player1.ws === ws ? game.player2 : game.player1;

      if (opponent.ws.readyState === WebSocket.OPEN) {
        opponent.ws.send(
          JSON.stringify({
            type: "opponent_disconnected",
            payload: { gameId },
          })
        );
      }

      clearTimeout(game.timer);
      delete activeGames[gameId];
      return;
    }
  }
};

module.exports = { initializeWebSocket };
