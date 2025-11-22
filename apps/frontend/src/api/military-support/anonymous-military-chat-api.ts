import { randomInteger, sample } from "remeda"

import type { Envelope } from "@/types"
import type { AnonymousMilitaryMessage } from "@/types/mongoose.gen"

import { getApiErrorMessage, http } from "@/utils"

interface AnonymousChatRoom {
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
