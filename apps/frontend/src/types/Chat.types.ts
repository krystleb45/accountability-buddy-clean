import type React from "react" // ✅ Import React for React.ReactNode

// ✅ Message status types
export type MessageStatus = "sent" | "delivered" | "seen"

/**
 * ✅ Represents a single chat message.
 */
export interface ChatMessage {
  avatarUrl: string
  message: React.ReactNode // ✅ Fixed Type (Supports text & JSX)
  text: string | undefined
  type: string
  id: string // Unique identifier for the message
  chatId: string // ✅ Ensure each message belongs to a chat
  senderId: string // ✅ Store sender's unique ID
  senderName: string // ✅ Store sender's display name
  content: string | React.ReactNode // ✅ Supports plain text & JSX content
  timestamp: string | Date // ✅ Support both Date objects & ISO string timestamps
  status?: MessageStatus // ✅ Read receipt status (optional)
  isSystemMessage?: boolean // Indicates if the message is system-generated
  reactions?: { userId: string; emoji: string }[] // ✅ Message reactions (optional)
  edited?: boolean // ✅ Tracks if the message was edited
  deleted?: boolean // ✅ Tracks if the message was deleted
}

/**
 * ✅ Represents a user in the chat system.
 */
export interface ChatUser {
  id: string // Unique identifier for the user
  name: string // Display name of the user
  avatarUrl?: string // Optional URL for the user's avatar
  isOnline: boolean // Indicates whether the user is online
}

/**
 * ✅ Props for the ChatBox component.
 */
export interface ChatBoxProps {
  chatId: string // ✅ Ensure ChatBox gets the chat ID
  onSendMessage?: (message: string) => void // Callback when a message is sent
  placeholder?: string // Placeholder text for the input box
  disabled?: boolean // Disables the input box
}

/**
 * ✅ Props for the ChatWindow component.
 */
export interface ChatWindowProps {
  chatId: string // ✅ Ensure ChatWindow gets the chat ID
  messages: ChatMessage[] // Array of chat messages to display
  currentUser: ChatUser // Information about the current user
  onSendMessage: (message: string) => void // Callback when a message is sent
  onUserClick?: (userId: string) => void // Optional callback when a user is clicked
  isLoading?: boolean // Indicates if the chat is loading
}

/**
 * ✅ Represents the typing indicator in the chat.
 */
export interface TypingIndicator {
  chatId: string // ✅ Ensure typing indicators belong to a chat
  userId: string // ID of the user who is typing
  typing: boolean // Indicates whether the user is currently typing
}
