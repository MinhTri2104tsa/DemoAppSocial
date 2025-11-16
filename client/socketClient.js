const { io } = require('socket.io-client');

// connect to backend socket
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:4000';

const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
});

module.exports = socket;