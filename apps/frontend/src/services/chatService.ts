// src/services/chatService.ts
import type { Socket } from "socket.io-client"

import { io } from "socket.io-client"

import { http } from "@/utils/http"

export interface ChatMessage {
  id: string
  chatId: string
  sender: {
    id: string
    name: string
  }
  content: string
  timestamp: string
  status: "sent" | "delivered" | "seen"
  reactions?: { userId: string; emoji: string }[]
  type?: "text" | "voice" | "image" | "file"
  fileUrl?: string
}

class ChatService {
  private socket: Socket | null = null

  connect(chatId: string): void {
    if (!this.socket) {
      this.socket = io(
        process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.example.com",
      )

      this.socket.on(`group-${chatId}`, (newMessage: ChatMessage) => {
        console.log("New message received:", newMessage)
      })

      this.socket.on(
        "messageRead",
        (data: { chatId: string; messageId: string; userId: string }) => {
          if (data.chatId === chatId) {
            console.log(
              `Message ${data.messageId} was read by user ${data.userId}`,
            )
          }
        },
      )

      this.socket.on(
        "messageReaction",
        (data: {
          chatId: string
          messageId: string
          reactions: { userId: string; emoji: string }[]
        }) => {
          console.log(
            `Reactions updated for message ${data.messageId}:`,
            data.reactions,
          )
        },
      )
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  async fetchMessages(chatId: string): Promise<ChatMessage[]> {
    if (!chatId) throw new Error("Chat ID is required to fetch messages.")
    try {
      const response = await http.get<ChatMessage[]>(
        `/groups/${chatId}/messages`,
      )
      return response.data
    } catch (error) {
      console.error("❌ [chatService::fetchMessages]", error)
      throw new Error("Failed to load messages.")
    }
  }

  async sendMessage(chatId: string, message: string): Promise<ChatMessage> {
    if (!chatId || !message.trim())
      throw new Error("Chat ID and message content are required.")
    try {
      const response = await http.post<ChatMessage>(
        `/groups/${chatId}/messages`,
        {
          content: message,
          type: "text",
        },
      )
      this.socket?.emit(`group-${chatId}`, response.data)
      return response.data
    } catch (error) {
      console.error("❌ [chatService::sendMessage]", error)
      throw new Error("Failed to send message.")
    }
  }

  async sendVoiceMessage(
    chatId: string,
    audioFile: File,
  ): Promise<ChatMessage> {
    if (!chatId || !audioFile)
      throw new Error("Chat ID and voice file are required.")
    try {
      const formData = new FormData()
      formData.append("audio", audioFile)
      const upload = await http.post<{ fileUrl: string }>(
        `/groups/${chatId}/upload-audio`,
        formData,
      )
      if (!upload.data.fileUrl)
        throw new Error("Failed to upload voice message.")
      const msgResp = await http.post<ChatMessage>(
        `/groups/${chatId}/messages`,
        {
          content: upload.data.fileUrl,
          type: "voice",
        },
      )
      this.socket?.emit(`group-${chatId}`, msgResp.data)
      return msgResp.data
    } catch (error) {
      console.error("❌ [chatService::sendVoiceMessage]", error)
      throw new Error("Failed to send voice message.")
    }
  }

  async sendImageMessage(
    chatId: string,
    imageFile: File,
  ): Promise<ChatMessage> {
    if (!chatId || !imageFile)
      throw new Error("Chat ID and image file are required.")
    try {
      const formData = new FormData()
      formData.append("image", imageFile)
      const upload = await http.post<{ fileUrl: string }>(
        `/groups/${chatId}/upload-image`,
        formData,
      )
      if (!upload.data.fileUrl) throw new Error("Failed to upload image.")
      const msgResp = await http.post<ChatMessage>(
        `/groups/${chatId}/messages`,
        {
          content: upload.data.fileUrl,
          type: "image",
        },
      )
      this.socket?.emit(`group-${chatId}`, msgResp.data)
      return msgResp.data
    } catch (error) {
      console.error("❌ [chatService::sendImageMessage]", error)
      throw new Error("Failed to send image message.")
    }
  }

  async sendFileMessage(chatId: string, file: File): Promise<ChatMessage> {
    if (!chatId || !file) throw new Error("Chat ID and file are required.")
    try {
      const formData = new FormData()
      formData.append("file", file)
      const upload = await http.post<{ fileUrl: string }>(
        `/groups/${chatId}/upload-file`,
        formData,
      )
      if (!upload.data.fileUrl) throw new Error("Failed to upload file.")
      const msgResp = await http.post<ChatMessage>(
        `/groups/${chatId}/messages`,
        {
          content: upload.data.fileUrl,
          type: "file",
        },
      )
      this.socket?.emit(`group-${chatId}`, msgResp.data)
      return msgResp.data
    } catch (error) {
      console.error("❌ [chatService::sendFileMessage]", error)
      throw new Error("Failed to send file message.")
    }
  }

  async markMessageAsRead(
    chatId: string,
    messageId: string,
    userId: string,
  ): Promise<void> {
    try {
      await http.post(`/groups/${chatId}/messages/${messageId}/read`, {
        userId,
      })
      this.socket?.emit("messageRead", { chatId, messageId, userId })
    } catch (error) {
      console.error(`❌ [chatService::markMessageAsRead]`, error)
    }
  }

  async addReaction(
    chatId: string,
    messageId: string,
    userId: string,
    emoji: string,
  ): Promise<void> {
    try {
      const res = await http.post<{
        reactions: { userId: string; emoji: string }[]
      }>(`/groups/${chatId}/messages/${messageId}/reactions`, { userId, emoji })
      this.socket?.emit("messageReaction", {
        chatId,
        messageId,
        reactions: res.data.reactions,
      })
    } catch (error) {
      console.error(`❌ [chatService::addReaction]`, error)
    }
  }
}

const chatService = new ChatService()
export default chatService
