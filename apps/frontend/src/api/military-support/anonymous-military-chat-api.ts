import axios from "axios"
import { randomInteger, sample } from "remeda"

import type { Envelope } from "@/types"
import type { AnonymousMilitaryMessage } from "@/types/mongoose.gen"

import { getApiErrorMessage, http } from "@/utils"

export interface AnonymousChatRoom {
  id: string
  name: string
  description: string
  icon: string
  memberCount: string
}

export type AnonymousMessage = Omit<
  AnonymousMilitaryMessage,
  "anonymousSessionId" | "room"
>

export interface AnonymousUser {
  sessionId: string
  displayName: string
}

// Response wrapper for anonymous chat API
interface AnonymousApiResponse<T> {
  success: boolean
  message: string
  data: T
}

// ✅ FIXED: Remove extra /api/ since NEXT_PUBLIC_API_URL already includes it
const ANONYMOUS_API_BASE = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/anonymous-military-chat`
  : "http://localhost:5050/api/anonymous-military-chat"

function logAnonymousErr(fn: string, error: unknown): void {
  if (axios.isAxiosError(error)) {
    console.error(
      `❌ [anonymousMilitaryChatApi::${fn}] Status: ${error.response?.status}`,
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
    console.error(`❌ [anonymousMilitaryChatApi::${fn}]`, error)
  }
}

/** GET /anonymous-military-chat/rooms - Get all available chat rooms */
export async function getAnonymousRooms() {
  try {
    const resp = await http.get<Envelope<{ rooms: AnonymousChatRoom[] }>>(
      "/anonymous-military-chat/rooms",
    )
    return resp.data.data.rooms
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

/** GET /anonymous-military-chat/rooms/:roomId/messages - Get messages for a room */
export async function getAnonymousMessages(roomId: string) {
  try {
    const resp = await http.get<Envelope<{ messages: AnonymousMessage[] }>>(
      `/anonymous-military-chat/rooms/${roomId}/messages`,
    )

    // Transform the response to match our interface
    return resp.data.data.messages
  } catch (err) {
    throw new Error(getApiErrorMessage(err as Error))
  }
}

/** POST /anonymous-military-chat/rooms/:roomId/message - Send a message */
export async function sendAnonymousMessage(
  roomId: string,
  message: string,
  user: AnonymousUser,
): Promise<{ messageId: string; isFlagged: boolean } | null> {
  if (!message.trim()) {
    console.error(
      "[anonymousMilitaryChatApi::sendAnonymousMessage] message is required",
    )
    return null
  }

  try {
    const resp = await axios.post<
      AnonymousApiResponse<{ messageId: string; isFlagged: boolean }>
    >(
      `${ANONYMOUS_API_BASE}/rooms/${roomId}/message`,
      { message: message.trim() },
      {
        headers: {
          "X-Anonymous-Session": user.sessionId,
          "X-Anonymous-Name": user.displayName,
        },
      },
    )
    return resp.data.data
  } catch (err) {
    logAnonymousErr("sendAnonymousMessage", err)
    return null
  }
}

/** Generate an anonymous user with random military-themed name */
export function generateAnonymousUser(
  sessionId?: string,
  displayName?: string,
): AnonymousUser {
  // @keep-sorted
  const adjectives = [
    "Bold",
    "Brave",
    "Courageous",
    "Dedicated",
    "Determined",
    "Disciplined",
    "Elite",
    "Fearless",
    "Fierce",
    "Gallant",
    "Heroic",
    "Honor",
    "Loyal",
    "Mighty",
    "Noble",
    "Resilient",
    "Steadfast",
    "Strategic",
    "Strong",
    "Tactical",
    "United",
    "Unwavering",
    "Valiant",
    "Vigilant",
  ]
  // @keep-sorted
  const nouns = [
    "Captain",
    "Commander",
    "Defender",
    "Engineer",
    "Fighter",
    "Guardian",
    "Hero",
    "Lieutenant",
    "Marine",
    "Medic",
    "Navigator",
    "Operative",
    "Peacekeeper",
    "Pilot",
    "Protector",
    "Ranger",
    "Sailor",
    "Scout",
    "Sergeant",
    "Sniper",
    "Soldier",
    "Trooper",
    "Veteran",
    "Warrior",
  ]

  const finalDisplayName =
    displayName ??
    `${sample(adjectives, 1)} ${sample(nouns, 1)} ${randomInteger(0, 9999)}`

  return {
    sessionId:
      sessionId ??
      `anon_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    displayName: finalDisplayName,
  }
}
