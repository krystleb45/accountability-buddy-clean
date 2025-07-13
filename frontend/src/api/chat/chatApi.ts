// src/chat/chatApi.ts

/**
 * A single chat message
 */
export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
}

/**
 * A group chat entity
 */
export interface Group {
  id: string;
  name: string;
  description: string;
  messages: Message[];
}

/**
 * The shape that your Express endpoint wraps around every response:
 *   { success: boolean;
 *     message: string;
 *     data: T;
 *   }
 */
interface Envelope<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Fetch all available chat groups.
 * GET /groups
 *
 * Because our rewrite maps /groups → BACKEND_URL/groups,
 * we call fetch('/groups') here.
 */
export async function fetchChatGroups(): Promise<Group[]> {
  try {
    const res = await fetch('/groups', { cache: 'no-store' });
    if (!res.ok) {
      console.error('fetchChatGroups failed:', await res.text());
      return [];
    }

    const envelope = (await res.json()) as Envelope<{ groups: Group[] }>;
    if (!envelope.success) {
      console.error('fetchChatGroups API returned error:', envelope.message);
      return [];
    }

    return envelope.data.groups;
  } catch (err) {
    console.error('❌ [chatApi::fetchChatGroups]', err);
    return [];
  }
}

/**
 * Fetch chat messages for a specific group.
 * GET /history/:groupId
 */
export async function fetchGroupMessages(groupId: string): Promise<Message[]> {
  if (!groupId) {
    console.error('❌ [chatApi::fetchGroupMessages] groupId is required');
    return [];
  }

  try {
    const res = await fetch(`/history/${encodeURIComponent(groupId)}`, { cache: 'no-store' });
    if (!res.ok) {
      console.error('fetchGroupMessages failed:', await res.text());
      return [];
    }

    const envelope = (await res.json()) as Envelope<{ chatHistory: Message[] }>;
    if (!envelope.success) {
      console.error('fetchGroupMessages API returned error:', envelope.message);
      return [];
    }

    return envelope.data.chatHistory;
  } catch (err) {
    console.error('❌ [chatApi::fetchGroupMessages]', err);
    return [];
  }
}

/**
 * Send a message in a group chat.
 * POST /send
 */
export async function sendGroupMessage(
  groupId: string,
  text: string
): Promise<Message | null> {
  if (!groupId || !text) {
    console.error('❌ [chatApi::sendGroupMessage] groupId and text are required');
    return null;
  }

  try {
    const res = await fetch('/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatId: groupId,
        message: text,
      }),
    });
    if (!res.ok) {
      console.error('sendGroupMessage failed:', await res.text());
      return null;
    }

    const envelope = (await res.json()) as Envelope<{ message: Message }>;
    if (!envelope.success) {
      console.error('sendGroupMessage API returned error:', envelope.message);
      return null;
    }

    return envelope.data.message;
  } catch (err) {
    console.error('❌ [chatApi::sendGroupMessage]', err);
    return null;
  }
}

/**
 * Create a new chat group.
 * POST /group
 */
export async function createChatGroup(
  groupName: string,
  members: string[]
): Promise<Group | null> {
  if (!groupName) {
    console.error('❌ [chatApi::createChatGroup] groupName is required');
    return null;
  }

  try {
    const res = await fetch('/group', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        groupName,
        members,
      }),
    });
    if (!res.ok) {
      console.error('createChatGroup failed:', await res.text());
      return null;
    }

    const envelope = (await res.json()) as Envelope<{ group: Group }>;
    if (!envelope.success) {
      console.error('createChatGroup API returned error:', envelope.message);
      return null;
    }

    return envelope.data.group;
  } catch (err) {
    console.error('❌ [chatApi::createChatGroup]', err);
    return null;
  }
}

export default {
  fetchChatGroups,
  fetchGroupMessages,
  sendGroupMessage,
  createChatGroup,
};
