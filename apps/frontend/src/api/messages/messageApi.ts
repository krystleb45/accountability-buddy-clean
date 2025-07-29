// src/api/messages/messageApi.ts
// -----------------------------------------------------------------------------
// Message API hooks for community chat messaging
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// Type Definitions
// -----------------------------------------------------------------------------
export interface Message {
  _id: string;
  communityId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
  // Enhanced fields for better messaging features
  updatedAt?: string;
  isEdited?: boolean;
  editedAt?: string;
  readBy?: Array<{
    userId: string;
    readAt: string;
  }>;
  reactions?: Array<{
    userId: string;
    emoji: string;
    createdAt: string;
  }>;
}

// Enhanced types for messaging threads and stats
export interface MessageThread {
  _id: string;
  participants: Array<{
    _id: string;
    name: string;
    avatar?: string;
    isOnline?: boolean;
  }>;
  group?: {
    _id: string;
    name: string;
    avatar?: string;
  };
  lastMessage?: Message;
  unreadCount: number;
  messageType: 'private' | 'group';
  createdAt: string;
  updatedAt: string;
}

export interface MessageStats {
  totalMessages: number;
  unreadMessages: number;
  totalThreads: number;
  privateMessages: number;
  groupMessages: number;
}

export interface RecentMessage {
  id: string;
  content: string;
  senderName: string;
  senderAvatar?: string | undefined;
  groupName?: string | undefined;
  isGroup: boolean;
  timestamp: string;
  isUnread: boolean;
}

interface SendResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T;
  hasMore?: boolean;
  total?: number;
  page?: number;
  limit?: number;
}

// -----------------------------------------------------------------------------
// Helper – uniform error logger
// -----------------------------------------------------------------------------
const logApiError = (scope: string, error: unknown): void => {
  console.error(`[messageApi] ${scope}:`, error);
};

// -----------------------------------------------------------------------------
// HTTP Helper Functions
// -----------------------------------------------------------------------------
const apiRequest = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  return response.json();
};

// -----------------------------------------------------------------------------
// Enhanced API Functions - Direct messaging and threads
// -----------------------------------------------------------------------------

/**
 * Fetch all message threads for the current user
 * GET /api/messages/threads
 */
export const fetchMessageThreads = async (filters?: {
  messageType?: 'private' | 'group';
  limit?: number;
  page?: number;
  search?: string;
}): Promise<MessageThread[]> => {
  try {
    console.log('🔍 fetchMessageThreads: Starting request...');

    const params = new URLSearchParams();
    if (filters?.messageType) params.append('messageType', filters.messageType);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.search) params.append('search', filters.search);

    const queryString = params.toString();
    const url = `/api/messages/threads${queryString ? `?${queryString}` : ''}`;

    console.log('🌐 fetchMessageThreads: URL:', url);

    const res = await apiRequest<SendResponse<MessageThread[]>>(url);

    console.log('✅ fetchMessageThreads: Success!', res.data?.length || 0, 'threads');
    return res.data || [];
  } catch (err) {
    console.error('❌ fetchMessageThreads: Error:', err);
    logApiError('fetchMessageThreads', err);
    return [];
  }
};

/**
 * Fetch messages in a specific thread
 * GET /api/messages/threads/:threadId
 */
export const fetchMessagesInThread = async (
  threadId: string,
  filters?: { limit?: number; page?: number; before?: string }
): Promise<{ messages: Message[]; hasMore: boolean; total: number }> => {
  if (!threadId) {
    console.error('[messageApi::fetchMessagesInThread] threadId is required');
    return { messages: [], hasMore: false, total: 0 };
  }

  try {
    console.log('🔍 fetchMessagesInThread: Starting request for thread:', threadId);

    const params = new URLSearchParams();
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.before) params.append('before', filters.before);

    const queryString = params.toString();
    const url = `/api/messages/threads/${encodeURIComponent(threadId)}${queryString ? `?${queryString}` : ''}`;

    console.log('🌐 fetchMessagesInThread: URL:', url);

    const res = await apiRequest<PaginatedResponse<Message[]>>(url);

    console.log('✅ fetchMessagesInThread: Success!', res.data?.length || 0, 'messages');
    return {
      messages: res.data || [],
      hasMore: res.hasMore || false,
      total: res.total || 0
    };
  } catch (err) {
    console.error('❌ fetchMessagesInThread: Error:', err);
    logApiError('fetchMessagesInThread', err);
    return { messages: [], hasMore: false, total: 0 };
  }
};

/**
 * Send a direct or group message
 * POST /api/messages
 */
export const sendDirectMessage = async (
  content: string,
  recipientId?: string,
  groupId?: string
): Promise<Message> => {
  if (!content.trim()) {
    console.error('[messageApi::sendDirectMessage] content is required');
    throw new Error('Message content is required');
  }

  if (!recipientId && !groupId) {
    console.error('[messageApi::sendDirectMessage] either recipientId or groupId is required');
    throw new Error('Recipient or group is required');
  }

  try {
    console.log('📤 sendDirectMessage: Starting request...');
    console.log('📋 Content:', content.substring(0, 50));
    console.log('👤 Recipient ID:', recipientId);
    console.log('👥 Group ID:', groupId);

    const messageData = {
      content: content.trim(),
      messageType: groupId ? 'group' : 'private',
      ...(groupId ? { groupId } : { recipientId })
    };

    const res = await apiRequest<SendResponse<Message>>('/api/messages', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });

    console.log('✅ sendDirectMessage: Success!', res.data._id);
    return res.data;
  } catch (err) {
    console.error('❌ sendDirectMessage: Error:', err);
    logApiError('sendDirectMessage', err);
    throw err;
  }
};

/**
 * Mark all messages in a thread as read
 * PUT /api/messages/threads/:threadId
 */
export const markThreadAsRead = async (threadId: string): Promise<void> => {
  if (!threadId) {
    console.error('[messageApi::markThreadAsRead] threadId is required');
    return;
  }

  try {
    console.log('📖 markThreadAsRead: Starting request for thread:', threadId);

    await apiRequest(`/api/messages/threads/${encodeURIComponent(threadId)}`, {
      method: 'PUT',
      body: JSON.stringify({ action: 'mark-read' }),
    });

    console.log('✅ markThreadAsRead: Success!');
  } catch (err) {
    console.error('❌ markThreadAsRead: Error:', err);
    logApiError('markThreadAsRead', err);
    throw err;
  }
};

/**
 * Add reaction to a message
 * PUT /api/messages/:messageId
 */
export const addMessageReaction = async (messageId: string, emoji: string): Promise<Message> => {
  if (!messageId || !emoji) {
    console.error('[messageApi::addMessageReaction] messageId and emoji are required');
    throw new Error('Message ID and emoji are required');
  }

  try {
    console.log('😊 addMessageReaction: Starting request...', messageId, emoji);

    const res = await apiRequest<SendResponse<Message>>(
      `/api/messages/${encodeURIComponent(messageId)}`,
      {
        method: 'PUT',
        body: JSON.stringify({ action: 'add-reaction', emoji }),
      }
    );

    console.log('✅ addMessageReaction: Success!');
    return res.data;
  } catch (err) {
    console.error('❌ addMessageReaction: Error:', err);
    logApiError('addMessageReaction', err);
    throw err;
  }
};

/**
 * Get message statistics
 * GET /api/messages/stats
 */
export const fetchMessageStats = async (): Promise<MessageStats> => {
  try {
    console.log('📊 fetchMessageStats: Starting request...');

    const res = await apiRequest<SendResponse<MessageStats>>('/api/messages/stats');

    console.log('✅ fetchMessageStats: Success!');
    return res.data;
  } catch (err) {
    console.error('❌ fetchMessageStats: Error:', err);
    logApiError('fetchMessageStats', err);
    return {
      totalMessages: 0,
      unreadMessages: 0,
      totalThreads: 0,
      privateMessages: 0,
      groupMessages: 0
    };
  }
};

// -----------------------------------------------------------------------------
// Legacy functions (kept for compatibility)
// -----------------------------------------------------------------------------

/**
 * Fetch messages for a specific community
 * GET /api/communities/:communityId/messages
 */
export const fetchMessages = async (
  communityId: string
): Promise<Message[]> => {
  if (!communityId) {
    console.error('[messageApi::fetchMessages] communityId is required');
    return [];
  }

  try {
    const res = await apiRequest<SendResponse<{ messages: Message[] }>>(
      `/api/communities/${encodeURIComponent(communityId)}/messages`
    );
    return res.data.messages;
  } catch (err) {
    logApiError('fetchMessages', err);
    return [];
  }
};

/**
 * Send a new message in a community
 * POST /api/communities/:communityId/messages
 */
export const sendMessage = async (
  communityId: string,
  content: string,
  senderId: string
): Promise<Message> => {
  if (!communityId || !content.trim() || !senderId) {
    console.error('[messageApi::sendMessage] communityId, content, and senderId are required');
    throw new Error('Missing required fields');
  }

  try {
    const res = await apiRequest<SendResponse<Message>>(
      `/api/communities/${encodeURIComponent(communityId)}/messages`,
      {
        method: 'POST',
        body: JSON.stringify({ content, senderId }),
      }
    );
    return res.data;
  } catch (err) {
    logApiError('sendMessage', err);
    throw err;
  }
};

// -----------------------------------------------------------------------------
// Default export with main functions
// -----------------------------------------------------------------------------
export default {
  fetchMessageThreads,
  fetchMessagesInThread,
  sendDirectMessage,
  markThreadAsRead,
  addMessageReaction,
  fetchMessageStats,
  fetchMessages,
  sendMessage,
};
