import { io } from 'socket.io-client';
import { API_URL } from './config';

let socket = null;

export function connectSocket(token) {
  if (socket?.connected) return socket;
  socket = io(API_URL, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
  });
  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

// ---- Emit helpers — payload shapes mirror backend/socket/socket.js exactly ----
export const emitSendMessage = (payload) => socket?.emit('send_message', payload);
export const emitTyping = (payload) => socket?.emit('typing', payload);
export const emitStopTyping = (payload) => socket?.emit('stop_typing', payload);
export const emitMessageRead = (payload) => socket?.emit('message_read', payload);
export const emitReact = (payload) => socket?.emit('react_to_message', payload);
export const emitJoinGroup = (groupId) => socket?.emit('join_group', groupId);
export const emitLeaveGroup = (groupId) => socket?.emit('leave_group', groupId);
