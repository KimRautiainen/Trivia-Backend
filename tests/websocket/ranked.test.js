const WebSocket = require("ws");

const serverUrl = "ws://localhost:3000";
const player1Token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcsInVzZXJuYW1lIjoiU2F1bGkiLCJlbWFpbCI6InNhdWxpQGVkdXNrdW50YS5maSIsInVzZXJBdmF0YXIiOiJhMWFmY2U2MzRiZDVkMTA3OGUxNjNiZGFjNDNiMzc3ZiIsInBhc3N3b3JkIjoiJDJhJDEwJGZRSzQzcVZSUHlBRjNDSFRTMHAuQ2VacDlvS2wuV0FFR3ZkQ2V2SFRJMDRkTUgzQnd1NnRhIiwiZXhwZXJpZW5jZVBvaW50cyI6MCwibGV2ZWwiOjEsIm1heFhwIjoxMDAsInRvdGFsQ29ycmVjdEFuc3dlcnMiOjAsInRvdGFsRmFsc2VBbnN3ZXJzIjowLCJyYW5rUG9pbnRzIjowLCJyYW5rTGV2ZWwiOjEsImlhdCI6MTczNTY0NjQyNX0.7faBT18jbYptrljt6PEC-Q9psp1ZgTY59luAXmyL6zQ"; // Replace with Player 1 JWT
const player2Token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjYsInVzZXJuYW1lIjoiTmlpbG8yMiIsImVtYWlsIjoibmlpbG9AMjIuZmkiLCJ1c2VyQXZhdGFyIjoiMWZkNjAyNGNhM2VhZGM4OTFkMDllZmMyNGU4NDQzYjIiLCJwYXNzd29yZCI6IiQyYSQxMCQycXZueWhlbkV0TzBEamNvQ3lOTTBla0Q1QzdITmFQMkVEaTA3Z2hxMUd2cFVYMUZJWGZELiIsImV4cGVyaWVuY2VQb2ludHMiOjAsImxldmVsIjoxLCJtYXhYcCI6MTAwLCJ0b3RhbENvcnJlY3RBbnN3ZXJzIjowLCJ0b3RhbEZhbHNlQW5zd2VycyI6MCwicmFua1BvaW50cyI6MCwicmFua0xldmVsIjoxLCJpYXQiOjE3MzU2NDYzNjV9.kDdBL-m54moSFz_eDZKDcHca-EY10x6r49Enh55_6Og"; // Replace with Player 2 JWT

let questions = []; // Shared questions between players
let gameId = null; // Shared game ID

// -- Test simulates 2 players answering all questions correctly, Testing lifecycle of live match -- //

// Helper to simulate answering questions
const answerQuestions = async (ws, userId) => {
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    const payload = {
      type: "answer_question",
      payload: {
        gameId,
        questionOrder: question.order, // Question order from API
        answer: question.correctAnswer, // Always choose the correct answer
      },
    };

    console.log(`User ${userId} answering question ${question.order}`);
    ws.send(JSON.stringify(payload));

    // Wait a bit before sending the next answer
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
};

// Helper to connect a player
const connectPlayer = (token, userId, onMessage) => {
  const ws = new WebSocket(serverUrl, [token]);

  ws.on("open", () => {
    console.log(`Player ${userId} connected to WebSocket server`);

    // Join matchmaking
    ws.send(
      JSON.stringify({
        type: "join_matchmaking",
        payload: {},
      })
    );
  });

  ws.on("message", async (data) => {
    const message = JSON.parse(data);
    console.log(`Player ${userId} received:`, message);

    if (message.type === "match_found") {
      gameId = message.payload.gameId;
      questions = message.payload.questions; // Save questions
    }

    if (onMessage) await onMessage(ws, message);
  });

  ws.on("close", () => {
    console.log(`Player ${userId} WebSocket connection closed`);
  });

  ws.on("error", (err) => {
    console.error(`Player ${userId} encountered error:`, err.message);
  });

  return ws;
};

// Simulate two players connecting and answering all questions
(async () => {
  const player1 = connectPlayer(player1Token, 1, async (ws, message) => {
    if (message.type === "match_found") {
      await answerQuestions(ws, 1); // Simulate Player 1 answering
    }
  });

  const player2 = connectPlayer(player2Token, 2, async (ws, message) => {
    if (message.type === "match_found") {
      await answerQuestions(ws, 2); // Simulate Player 2 answering
    }
  });

  // Close connections after the game ends
  setTimeout(() => {
    player1.close();
    player2.close();
    console.log("Test completed");
  }, 30000); // Allow enough time for the game to complete
})();
