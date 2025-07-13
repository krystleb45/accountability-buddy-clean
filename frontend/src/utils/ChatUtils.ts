// ✅ ChatUtils.ts
import { ChatMessage } from '@/types/Chat.types';

/**
 * Formats a timestamp into a human-readable string.
 * Supports both Date and ISO string timestamps.
 * @param timestamp - The timestamp to format.
 * @returns A formatted string, e.g., "Jan 18, 2025, 3:45 PM".
 */
export const formatTimestamp = (timestamp: string | Date): string => {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

/**
 * Escapes HTML special characters to prevent XSS.
 * @param input - The string to sanitize.
 * @returns The escaped string.
 */
export const sanitizeString = (input: string): string =>
  input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

/**
 * Sanitizes message contents in an array of ChatMessage.
 * @param messages - Array of chat messages.
 * @returns A new array with sanitized content fields.
 */
export const sanitizeMessages = (messages: ChatMessage[]): ChatMessage[] =>
  messages.map((msg) => ({
    ...msg,
    content: sanitizeString(String(msg.content)),
  }));

/**
 * Represents grouped messages by a single sender.
 */
export interface GroupedMessages {
  senderId: string;
  senderName: string;
  messages: ChatMessage[];
}

/**
 * Groups messages by sender and fills missing fields.
 * @param messages - The array of chat messages to group.
 * @returns Array of grouped messages by sender.
 */
export const groupMessagesBySender = (messages: ChatMessage[]): GroupedMessages[] => {
  const map: Record<string, GroupedMessages> = {};
  messages.forEach((msg) => {
    const key = msg.senderId;
    const name = msg.senderName || 'Unknown User';
    if (!map[key]) {
      map[key] = { senderId: key, senderName: name, messages: [] };
    }
    map[key].messages.push({
      ...msg,
      reactions: msg.reactions ?? [],
    });
  });
  return Object.values(map);
};

/**
 * Simulates a typing indicator with a Promise-based delay.
 * @param delayMs - Milliseconds to wait before resolving.
 * @returns Promise that resolves after delay.
 */
export const simulateTypingIndicator = (delayMs = 2000): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, delayMs));

/**
 * Validates that a chat message is non-empty after trimming.
 * @param message - The message string to validate.
 * @returns True if valid, false otherwise.
 */
export const isValidMessage = (message: string): boolean => message.trim().length > 0;

/**
 * Adds an emoji reaction to a specific message.
 * @param messages - Array of chat messages.
 * @param messageId - ID of the message to react to.
 * @param userId - ID of the user reacting.
 * @param emoji - Emoji character.
 * @returns New array with updated reactions.
 */
export const addReactionToMessage = (
  messages: ChatMessage[],
  messageId: string,
  userId: string,
  emoji: string,
): ChatMessage[] =>
  messages.map((msg) =>
    msg.id === messageId
      ? {
          ...msg,
          reactions: [...(msg.reactions ?? []), { userId, emoji }],
        }
      : msg,
  );
