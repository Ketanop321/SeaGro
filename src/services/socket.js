import { io } from 'socket.io-client';

let socket = null;

export const initializeSocket = (token) => {
  if (!token) {
    console.error('Token required for socket initialization');
    return null;
  }

  if (!socket) {
    socket = io('http://localhost:5000', {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socket.on('connect', () => {
      console.log('Socket connected');
      socket.emit('auth', token);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  return socket;
};

export const getSocket = (token) => {
  if (!socket && token) {
    socket = initializeSocket(token);
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};