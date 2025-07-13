// 2. NEW: src/api/military-support/anonymousMilitaryChatApi.ts (for anonymous users)
import axios from 'axios';

export interface AnonymousChatRoom {
  id: string;
  name: string;
  description: string;
  icon: string;
  memberCount: string;
}

export interface AnonymousMessage {
  id: string;
  displayName: string;
  message: string;
  timestamp: Date;
  isFlagged?: boolean;
}

export interface AnonymousUser {
  sessionId: string;
  displayName: string;
}

// Response wrapper for anonymous chat API
interface AnonymousApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const ANONYMOUS_API_BASE = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api/anonymous-military-chat`
  : 'http://localhost:5050/api/anonymous-military-chat';

function logAnonymousErr(fn: string, error: unknown): void {
  if (axios.isAxiosError(error)) {
    console.error(`❌ [anonymousMilitaryChatApi::${fn}]`, error.response?.data || error.message);
  } else {
    console.error(`❌ [anonymousMilitaryChatApi::${fn}]`, error);
  }
}

/** GET /anonymous-military-chat/rooms - Get all available chat rooms */
export async function getAnonymousRooms(): Promise<AnonymousChatRoom[]> {
  try {
    const resp = await axios.get<AnonymousApiResponse<{ rooms: AnonymousChatRoom[] }>>(
      `${ANONYMOUS_API_BASE}/rooms`
    );
    return resp.data.data.rooms;
  } catch (err) {
    logAnonymousErr('getAnonymousRooms', err);
    return [];
  }
}

/** POST /anonymous-military-chat/rooms/:roomId/join - Join a chat room */
export async function joinAnonymousRoom(
  roomId: string,
  user: AnonymousUser
): Promise<{ memberCount: number } | null> {
  try {
    const resp = await axios.post<AnonymousApiResponse<{ memberCount: number }>>(
      `${ANONYMOUS_API_BASE}/rooms/${roomId}/join`,
      {},
      {
        headers: {
          'X-Anonymous-Session': user.sessionId,
          'X-Anonymous-Name': user.displayName
        }
      }
    );
    return resp.data.data;
  } catch (err) {
    logAnonymousErr('joinAnonymousRoom', err);
    return null;
  }
}

/** POST /anonymous-military-chat/rooms/:roomId/leave - Leave a chat room */
export async function leaveAnonymousRoom(
  roomId: string,
  user: AnonymousUser
): Promise<boolean> {
  try {
    await axios.post(
      `${ANONYMOUS_API_BASE}/rooms/${roomId}/leave`,
      {},
      {
        headers: {
          'X-Anonymous-Session': user.sessionId,
          'X-Anonymous-Name': user.displayName
        }
      }
    );
    return true;
  } catch (err) {
    logAnonymousErr('leaveAnonymousRoom', err);
    return false;
  }
}

/** GET /anonymous-military-chat/rooms/:roomId/messages - Get messages for a room */
export async function getAnonymousMessages(roomId: string): Promise<AnonymousMessage[]> {
  try {
    const resp = await axios.get<AnonymousApiResponse<{ messages: any[] }>>(
      `${ANONYMOUS_API_BASE}/rooms/${roomId}/messages`
    );

    // Transform the response to match our interface
    return resp.data.data.messages.map((msg: any) => ({
      id: msg._id || msg.id,
      displayName: msg.displayName,
      message: msg.message,
      timestamp: new Date(msg.createdAt || msg.timestamp),
      isFlagged: msg.isFlagged
    }));
  } catch (err) {
    logAnonymousErr('getAnonymousMessages', err);
    return [];
  }
}

/** POST /anonymous-military-chat/rooms/:roomId/message - Send a message */
export async function sendAnonymousMessage(
  roomId: string,
  message: string,
  user: AnonymousUser
): Promise<{ messageId: string; isFlagged: boolean } | null> {
  if (!message.trim()) {
    console.error('[anonymousMilitaryChatApi::sendAnonymousMessage] message is required');
    return null;
  }

  try {
    const resp = await axios.post<AnonymousApiResponse<{ messageId: string; isFlagged: boolean }>>(
      `${ANONYMOUS_API_BASE}/rooms/${roomId}/message`,
      { message: message.trim() },
      {
        headers: {
          'X-Anonymous-Session': user.sessionId,
          'X-Anonymous-Name': user.displayName
        }
      }
    );
    return resp.data.data;
  } catch (err) {
    logAnonymousErr('sendAnonymousMessage', err);
    return null;
  }
}

/** GET /anonymous-military-chat/rooms/:roomId/members - Get member count */
export async function getAnonymousRoomMemberCount(roomId: string): Promise<number> {
  try {
    const resp = await axios.get<AnonymousApiResponse<{ memberCount: number }>>(
      `${ANONYMOUS_API_BASE}/rooms/${roomId}/members`
    );
    return resp.data.data.memberCount;
  } catch (err) {
    logAnonymousErr('getAnonymousRoomMemberCount', err);
    return 0;
  }
}

/** Generate an anonymous user with random military-themed name */
export function generateAnonymousUser(): AnonymousUser {
  const adjectives = ['Brave', 'Strong', 'Resilient', 'Courageous', 'United', 'Dedicated', 'Honor', 'Loyal'];
  const nouns = ['Warrior', 'Guardian', 'Defender', 'Veteran', 'Hero', 'Soldier', 'Marine', 'Sailor'];

  const displayName = `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;

  return {
    sessionId: `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    displayName
  };
}

export const anonymousMilitaryChatApi = {
  getAnonymousRooms,
  joinAnonymousRoom,
  leaveAnonymousRoom,
  getAnonymousMessages,
  sendAnonymousMessage,
  getAnonymousRoomMemberCount,
  generateAnonymousUser
};

export default anonymousMilitaryChatApi;
