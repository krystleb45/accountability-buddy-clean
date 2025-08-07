// src/services/directChatService.ts
import axios from "axios"

import { http } from "@/lib/http"

export interface DirectMessage {
  id: string
  chatId?: string // present for group chats
  friendId?: string // present for private chats
  sender: { id: string; name: string }
  content: string
  timestamp: string
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

function handleError<T>(fn: string, error: unknown, fallback: T): T {
  if (axios.isAxiosError(error)) {
    console.error(
      `❌ [directChatService::${fn}]`,
      error.response?.data || error.message,
    )
  } else {
    console.error(`❌ [directChatService::${fn}]`, error)
  }
  return fallback
}

const DirectChatService = {
  /** Send a message to a group chat */
  async sendToGroup(
    chatId: string,
    message: string,
  ): Promise<ApiResponse<DirectMessage>> {
    if (!chatId || !message.trim()) {
      return { success: false, message: "chatId and message are required" }
    }
    try {
      const { data } = await http.post<DirectMessage>("/chat/send", {
        chatId,
        message,
      })
      return { success: true, data }
    } catch (err) {
      return handleError("sendToGroup", err, { success: false })
    }
  },

  /** Send a private message to a friend */
  async sendToFriend(
    friendId: string,
    message: string,
  ): Promise<ApiResponse<DirectMessage>> {
    if (!friendId || !message.trim()) {
      return { success: false, message: "friendId and message are required" }
    }
    try {
      const { data } = await http.post<DirectMessage>(
        `/chat/private/${friendId}`,
        { message },
      )
      return { success: true, data }
    } catch (err) {
      return handleError("sendToFriend", err, { success: false })
    }
  },

  /** Fetch private chat history with a friend */
  async fetchPrivateHistory(
    friendId: string,
  ): Promise<ApiResponse<DirectMessage[]>> {
    if (!friendId) {
      return { success: false, message: "friendId is required", data: [] }
    }
    try {
      const { data } = await http.get<DirectMessage[]>(
        `/chat/private/${friendId}`,
      )
      return { success: true, data }
    } catch (err) {
      return handleError("fetchPrivateHistory", err, {
        success: false,
        data: [],
      })
    }
  },
}

export default DirectChatService
