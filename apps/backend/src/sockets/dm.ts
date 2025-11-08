import type { Server, Socket } from "socket.io"

import { JOIN_DM_ROOM, LEAVE_DM_ROOM } from "@ab/shared/socket-events"

import { User } from "../api/models/User"
import { logger } from "../utils/winstonLogger"

function dmSocket(io: Server, socket: Socket): void {
  socket.on(JOIN_DM_ROOM, async (data: { roomId: string }) => {
    try {
      const chatId = data.roomId
      const userId = socket.data.user?.id

      if (!chatId || !userId) {
        socket.emit("error", "Chat ID and User ID are required.")
        return
      }

      const user = await User.findById(userId).select("username").lean()
      if (!user) {
        socket.emit("error", "User not found.")
        return
      }

      void socket.join(chatId)
      logger.info(`User ${userId} joined chat room ${chatId}`)
    } catch (error) {
      logger.error(`Error joining chat room: ${(error as Error).message}`)
      socket.emit("error", "Failed to join chat room.")
    }
  })

  socket.on(LEAVE_DM_ROOM, async (data: { roomId: string }) => {
    try {
      const chatId = data.roomId
      const userId = socket.data.user?.id

      if (!chatId || !userId) {
        socket.emit("error", "Chat ID and User ID are required.")
        return
      }

      const user = await User.findById(userId).select("username").lean()
      if (!user) {
        socket.emit("error", "User not found.")
        return
      }

      void socket.leave(chatId)
      logger.info(`User ${userId} left chat room ${chatId}`)
    } catch (error) {
      logger.error(`Error leaving chat room: ${(error as Error).message}`)
      socket.emit("error", "Failed to leave chat room.")
    }
  })
}

export default dmSocket
