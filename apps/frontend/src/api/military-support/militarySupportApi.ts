// FIXED: src/military-support/militarySupportApi.ts

import axios from "axios"

import { http } from "@/utils/http"

export interface SupportResource {
  _id: string
  title: string
  url: string
  description: string
  category: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Chatroom {
  _id: string
  name: string
  description: string
  members: string[]
  visibility: "public" | "private"
  isActive: boolean
  createdAt: string
  updatedAt: string
  memberCount: number
}

export interface ChatMessage {
  _id: string
  chatroom: string
  user: {
    _id: string
    username: string
    rank?: string
  }
  text: string
  timestamp: string
  isDeleted: boolean
  attachments: string[]
  createdAt: string
  updatedAt: string
}

export interface Disclaimer {
  disclaimer: string
}

// Response wrapper interface to match your backend
interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

function logErr(fn: string, error: unknown): void {
  if (axios.isAxiosError(error)) {
    console.error(
      `❌ [militarySupportApi::${fn}] Status: ${error.response?.status}`,
      {
        url: error.config?.url,
        method: error.config?.method,
        data: error.response?.data,
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
      },
    )
  } else {
    console.error(`❌ [militarySupportApi::${fn}]`, error)
  }
}

/** GET /military-support/resources - FIXED: Now public, no auth required */
export async function fetchResources(): Promise<SupportResource[]> {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050/api"}/military-support/resources`
    console.log("🔍 [fetchResources] Making request to:", url)
    console.log(
      "🔍 [fetchResources] NEXT_PUBLIC_API_URL:",
      process.env.NEXT_PUBLIC_API_URL,
    )

    const resp =
      await axios.get<ApiResponse<{ resources: SupportResource[] }>>(url)
    console.log("✅ [fetchResources] Success:", resp.status, resp.data)
    return resp.data.data.resources
  } catch (err) {
    logErr("fetchResources", err)
    return []
  }
}

/** GET /military-support/disclaimer - FIXED: Now public, no auth required */
export async function fetchDisclaimer(): Promise<Disclaimer | null> {
  try {
    // ✅ FIXED: Remove extra /api/ since NEXT_PUBLIC_API_URL already includes it
    const resp = await axios.get<ApiResponse<Disclaimer>>(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050/api"}/military-support/disclaimer`,
    )
    return resp.data.data
  } catch (err) {
    logErr("fetchDisclaimer", err)
    return null
  }
}

/** POST /military-support/chat/send - AUTHENTICATED: Requires login */
export async function sendChatMessage(
  chatroomId: string,
  message: string,
): Promise<ChatMessage | null> {
  if (!chatroomId || !message.trim()) {
    console.error("[militarySupportApi::sendChatMessage] invalid args")
    return null
  }
  try {
    const resp = await http.post<ApiResponse<{ message: ChatMessage }>>(
      "/military-support/chat/send",
      { chatroomId, message },
    )
    return resp.data.data.message
  } catch (err) {
    logErr("sendChatMessage", err)
    return null
  }
}

/** GET /military-support/chatrooms - AUTHENTICATED: Requires login */
export async function fetchChatrooms(): Promise<Chatroom[]> {
  try {
    const resp = await http.get<ApiResponse<{ chatrooms: Chatroom[] }>>(
      "/military-support/chatrooms",
    )
    return resp.data.data.chatrooms
  } catch (err) {
    logErr("fetchChatrooms", err)
    return []
  }
}

/** POST /military-support/chatrooms - AUTHENTICATED: Requires login */
export async function createChatroom(
  name: string,
  description: string,
): Promise<Chatroom | null> {
  if (!name.trim()) {
    console.error("[militarySupportApi::createChatroom] name is required")
    return null
  }
  try {
    const resp = await http.post<ApiResponse<{ chatroom: Chatroom }>>(
      "/military-support/chatrooms",
      { name, description },
    )
    return resp.data.data.chatroom
  } catch (err) {
    logErr("createChatroom", err)
    return null
  }
}

export default {
  fetchResources,
  fetchDisclaimer,
  sendChatMessage,
  fetchChatrooms,
  createChatroom,
}
