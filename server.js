const http = require("http");
const app = require("./app");
const { initializeWebSocket } = require("./websocket");

const port = process.env.PORT || 3000;
const server = http.createServer(app);

initializeWebSocket(server);

server.listen(port, () => console.log(`Server running on port ${port}`));
