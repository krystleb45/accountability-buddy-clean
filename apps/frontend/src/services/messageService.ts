// src/services/messageService.ts
import axios from "axios"

import { http } from "@/utils/http"

export interface Message {
  _id: string
  sender: string
  receiver: string
  content: string
  createdAt: string
  isRead?: boolean
}

export interface Pagination {
  totalMessages: number
  currentPage: number
  totalPages: number
}

export interface MessageListResponse {
  messages: Message[]
  pagination: Pagination
}

function handleError<T>(fn: string, error: unknown, fallback?: T): T {
  if (axios.isAxiosError(error)) {
    console.error(
      `❌ [messageService::${fn}]`,
      error.response?.data || error.message,
    )
  } else {
    console.error(`❌ [messageService::${fn}]`, error)
  }
  return fallback as T
}

const MessageService = {
  /** POST /messages */
  async sendMessage(receiverId: string, content: string): Promise<Message> {
    try {
      const resp = await http.post<Message>("/messages", {
        receiverId,
        message: content,
      })
      return resp.data
    } catch (err) {
      return handleError("sendMessage", err, {} as Message)
    }
  },

  /** GET /messages/:userId?page=&limit= */
  async getConversation(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<MessageListResponse> {
    try {
      const resp = await http.get<MessageListResponse>(
        `/messages/${encodeURIComponent(userId)}`,
        {
          params: { page, limit },
        },
      )
      return resp.data
    } catch (err) {
      return handleError("getConversation", err, {
        messages: [],
        pagination: { totalMessages: 0, currentPage: page, totalPages: 0 },
      })
    }
  },

  /** DELETE /messages/:messageId */
  async deleteMessage(messageId: string): Promise<boolean> {
    try {
      await http.delete(`/messages/${encodeURIComponent(messageId)}`)
      return true
    } catch (err) {
      handleError("deleteMessage", err)
      return false
    }
  },

  /** PATCH /messages/:userId/read */
  async markAsRead(userId: string): Promise<number> {
    try {
      const resp = await http.patch<{ updatedMessages: number }>(
        `/messages/${encodeURIComponent(userId)}/read`,
      )
      return resp.data.updatedMessages
    } catch (err) {
      return handleError("markAsRead", err, 0)
    }
  },
}

export default MessageService
