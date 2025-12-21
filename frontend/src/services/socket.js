import io from 'socket.io-client';

// Use the same URL as your API
const SOCKET_URL = 'http://localhost:5000';

export const socket = io(SOCKET_URL, {
  transports: ['websocket'], // Force WebSocket protocol for better performance
  autoConnect: true,
});