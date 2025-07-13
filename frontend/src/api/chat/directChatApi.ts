// src/chat/directChatApi.ts

import axios from 'axios';
import { http } from '@/utils/http';

/**
 * A direct message (group or private)
 */
export interface DirectMessage {
  id: string;
  chatId?: string; // present for group chats
  friendId?: string; // present for private chats
  sender: { id: string; name: string };
  content: string;
  timestamp: string;
}

/**
 * Send a message to a group chat
 * POST /chat/send
 */
export async function sendToGroup(
  chatId: string,
  message: string
): Promise<DirectMessage | null> {
  if (!chatId || !message.trim()) {
    console.error('[directChatApi::sendToGroup] chatId and message are required');
    return null;
  }
  try {
    const { data } = await http.post<DirectMessage>('/chat/send', { chatId, message });
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[directChatApi::sendToGroup]', error.response?.data || error.message);
    } else {
      console.error('[directChatApi::sendToGroup]', error);
    }
    return null;
  }
}

/**
 * Send a private message to a friend
 * POST /chat/private/:friendId
 */
export async function sendToFriend(
  friendId: string,
  message: string
): Promise<DirectMessage | null> {
  if (!friendId || !message.trim()) {
    console.error('[directChatApi::sendToFriend] friendId and message are required');
    return null;
  }
  try {
    const { data } = await http.post<DirectMessage>(
      `/chat/private/${encodeURIComponent(friendId)}`,
      { message }
    );
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[directChatApi::sendToFriend]', error.response?.data || error.message);
    } else {
      console.error('[directChatApi::sendToFriend]', error);
    }
    return null;
  }
}

/**
 * Fetch private chat history with a friend
 * GET /chat/private/:friendId
 */
export async function fetchPrivateHistory(friendId: string): Promise<DirectMessage[]> {
  if (!friendId) {
    console.error('[directChatApi::fetchPrivateHistory] friendId is required');
    return [];
  }
  try {
    const { data } = await http.get<DirectMessage[]>(
      `/chat/private/${encodeURIComponent(friendId)}`
    );
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[directChatApi::fetchPrivateHistory]', error.response?.data || error.message);
    } else {
      console.error('[directChatApi::fetchPrivateHistory]', error);
    }
    return [];
  }
}

export default {
  sendToGroup,
  sendToFriend,
  fetchPrivateHistory,
};
