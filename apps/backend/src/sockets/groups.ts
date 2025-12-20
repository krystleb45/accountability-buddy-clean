import type { Server, Socket } from "socket.io"

import {
  JOIN_GROUP_ROOM,
  LEAVE_GROUP_ROOM,
  USER_JOINED_GROUP,
  USER_LEFT_GROUP,
} from "@ab/shared/socket-events"

import { User } from "../api/models/User.js"
import { logger } from "../utils/winston-logger.js"

function groupSocket(io: Server, socket: Socket): void {
  socket.on(JOIN_GROUP_ROOM, async (data: { roomId: string }) => {
    try {
      const groupId = data.roomId
      const userId = socket.data.user?.id

      if (!groupId || !userId) {
        socket.emit("error", "Group ID and User ID are required.")
        return
      }

      const user = await User.findById(userId).select("username").lean()
      if (!user) {
        socket.emit("error", "User not found.")
        return
      }

      void socket.join(groupId)
      logger.info(`User ${userId} joined group room ${groupId}`)

      // Notify other group members that a new user has joined

      socket.to(groupId).emit(USER_JOINED_GROUP, {
        userId,
        username: user.username,
        groupId,
      })
    } catch (error) {
      logger.error(`Error joining group room: ${(error as Error).message}`)
      socket.emit("error", "Failed to join group room.")
    }
  })

  socket.on(LEAVE_GROUP_ROOM, async (data: { roomId: string }) => {
    try {
      const groupId = data.roomId
      const userId = socket.data.user?.id

      if (!groupId || !userId) {
        socket.emit("error", "Group ID and User ID are required.")
        return
      }

      const user = await User.findById(userId).select("username").lean()
      if (!user) {
        socket.emit("error", "User not found.")
        return
      }

      void socket.leave(groupId)
      logger.info(`User ${userId} left group room ${groupId}`)

      // Optionally, notify other group members that a user has left
      socket.to(groupId).emit(USER_LEFT_GROUP, {
        userId,
        username: user.username,
        groupId,
      })
    } catch (error) {
      logger.error(`Error leaving group room: ${(error as Error).message}`)
      socket.emit("error", "Failed to leave group room.")
    }
  })
}

export default groupSocket
