const http = require("http");
const app = require("./app");
const socketIo = require("socket.io");

const port = process.env.PORT || 3000;
const server = http.createServer(app);

const io = socketIo(server);

let users = {};

io.on("connection", (socket) => {
  console.log("A user connected: ", socket.id);

  // Store user with socket ID
  socket.on("register", (userId) => {
    users[userId] = socket.id;
    console.log("User registered", userId, socket.id);
  });

  // Handle Challenge
  socket.on("challenge", ({ challengerId, challengedId }) => {
    console.log(
      `Challenger ID: ${challengerId}, Challenged ID: ${challengedId}`
    );
    if (users[challengedId]) {
      io.to(users[challengedId]).emit("receiveChallenge", { challengerId });
    } else {
      console.log("Challenged user is not connected");
    }
  });

  // Handle acceptance of challenge
  socket.on("acceptChallenge", ({ challengerId, challengedId }) => {
    const roomId = `${challengerId}-${challengedId}`;
    socket.join(roomId);
    io.to(users[challengerId]).emit("challengeAccepted", {
      challengedId,
      roomId,
    });
    io.to(users[challengedId]).emit("challengeAccepted", {
      challengerId,
      roomId,
    });
    console.log(`Room created: ${roomId}`);
  });

  // Handle quiz answer
  socket.on("quizAnswer", ({ roomId, userId, answer }) => {
    io.to(roomId).emit("receiveAnswer", { userId, answer });
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    // Remove user from users object
    for (let userId in users) {
      if (users[userId] === socket.id) {
        delete users[userId];
        break;
      }
    }
  });
});

server.listen(port, () => console.log(`Server running on port ${port}`));
