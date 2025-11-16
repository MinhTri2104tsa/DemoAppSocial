import { io } from 'socket.io-client';

// connect to backend socket
const SOCKET_URL ='http://localhost:4000';

const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
});

export default socket;
