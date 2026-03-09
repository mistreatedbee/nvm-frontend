import { io, Socket } from 'socket.io-client';

let socketInstance: Socket | null = null;

function getSocketUrl() {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  if (apiUrl.endsWith('/api')) {
    return apiUrl.slice(0, -4);
  }
  return apiUrl;
}

export function connectChatSocket(token: string) {
  if (!token) return null;

  if (socketInstance) {
    return socketInstance;
  }

  socketInstance = io(getSocketUrl(), {
    auth: {
      token: `Bearer ${token}`
    },
    transports: ['websocket', 'polling'],
    reconnection: true
  });

  return socketInstance;
}

export function getChatSocket() {
  return socketInstance;
}

export function disconnectChatSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}
