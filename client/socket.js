const { io } =  require("socket.io-client");

const socket = io("http://localhost:4000", {
  transports: ["websocket"], // tránh lỗi polling
});

module.exports = socket;