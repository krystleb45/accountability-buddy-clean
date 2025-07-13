// src/utils/socket.ts
import { io, Socket } from 'socket.io-client';

const SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_SERVER || 'http://localhost:5050';

// -----------------------------------------------------------------------------
// Events the server can send to the client
// -----------------------------------------------------------------------------
export interface ServerToClientEvents {
  receiveMessage(data: {
    chatId: string;
    senderId: string;
    senderName: string;
    message: string;
    timestamp: string;
  }): void;
  userTyping(data: { chatId: string; userId: string; username: string }): void;
  userStoppedTyping(data: { chatId: string; userId: string }): void;
  messageRead(data: { chatId: string; messageId: string; userId: string }): void;
  groupUpdated(): void;
  newMessage(data: { groupId: string }): void;
  groupActiveUsers(data: { groupId: string; activeUsers: number }): void;
  messageReaction(data: {
    chatId: string;
    messageId: string;
    reactions: Array<{ userId: string; emoji: string }>;
  }): void;
  mentionNotification(data: { chatId: string; mentionedUsers: string[] }): void;
}

// -----------------------------------------------------------------------------
// Events the client can emit to the server
// -----------------------------------------------------------------------------
export interface ClientToServerEvents {
  sendMessage(data: {
    chatId: string;
    message?: string;
    content?: string;
    senderId?: string;
  }): void;
  typing(data: { chatId: string; userId: string; username: string }): void;
  stopTyping(data: { chatId: string; userId: string }): void;
  markAsRead(data: { chatId: string; messageId: string; userId: string }): void;
  joinRoom(room: string): void;
  leaveRoom(room: string): void;
  addReaction(data: { chatId: string; messageId: string; reaction: string }): void;
  updateGroups(): void;
  mentionNotification(data: { chatId: string; mentionedUsers: string[] }): void;
}

// Create and export the socket instance with typed events
const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SERVER_URL, {
  autoConnect: false,
  withCredentials: true,
});

/**
 * Initialize socket connection with an auth token
 */
export function connectSocket(token: string): void {
  socket.auth = { token };
  socket.connect();
}

/**
 * Disconnect the socket
 */
export function disconnectSocket(): void {
  socket.disconnect();
}

/**
 * Tell the server this message has been read
 */
export function markMessageAsRead(
  chatId: string,
  messageId: string,
  userId: string
): void {
  socket.emit('markAsRead', { chatId, messageId, userId });
}

export default socket;
