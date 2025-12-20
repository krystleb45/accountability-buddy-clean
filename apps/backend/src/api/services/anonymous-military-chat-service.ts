import { ROOM_DETAILS, VALID_ROOMS } from "@ab/shared/military-chat-rooms"
import { sub } from "date-fns"

import { createError } from "../middleware/errorHandler.js"
import {
  AnonymousMilitaryMessage,
  AnonymousSession,
} from "../models/AnonymousMilitaryChat.js"

// Types for return values
interface ChatRoom {
  id: string
  name: string
  description: string
  icon: string
  memberCount: string
}

class AnonymousMilitaryChatService {
  /**
   * Get all available anonymous chat rooms with member counts
   */
  static async getRooms(): Promise<ChatRoom[]> {
    return await Promise.all(
      VALID_ROOMS.map(async (roomId) => {
        const memberCount = await AnonymousSession.countDocuments({
          room: roomId,
          lastActive: { $gte: sub(new Date(), { minutes: 5 }) }, // Active in last 5 minutes
        })

        return {
          id: roomId,
          ...ROOM_DETAILS[roomId],
          memberCount: `${memberCount} online`,
        }
      }),
    )
  }

  /**
   * Get recent messages for a room
   */
  static async getMessages(roomId: string, limit = 50) {
    if (!VALID_ROOMS.includes(roomId as (typeof VALID_ROOMS)[number])) {
      throw createError("Invalid room ID", 400)
    }

    const messages = await AnonymousMilitaryMessage.find({ room: roomId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("-anonymousSessionId -room")

    return messages.reverse() // Return oldest first for chat display
  }
}

export default AnonymousMilitaryChatService
