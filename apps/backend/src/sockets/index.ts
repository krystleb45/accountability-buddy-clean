// Force rebuild - Dec 21
import type { Server as HttpServer } from "node:http"
import type { Socket } from "socket.io"

import { USER_OFFLINE, USER_ONLINE } from "@ab/shared/socket-events"
import { Server } from "socket.io"

import { User } from "../api/models/User.js"
import AuthService from "../api/services/AuthService.js"
import { logger } from "../utils/winston-logger.js"
import { setupAnonymousMilitaryChat } from "./anonymous-military-chat.js"
import dmSocket from "./dm.js"
import groupSocket from "./groups.js"

function socketServer(server: HttpServer) {
  const io = new Server(server, {
    addTrailingSlash: false,
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
      credentials: true,
    },
  })

  setupAnonymousMilitaryChat(io)

  /**
   * @desc    Middleware to authenticate WebSocket connections using JWT.
   * NOTE: This only applies to the default namespace, not /anonymous-military-chat
   */
  io.use(async (socket: Socket, next) => {
    try {
      const rawToken = socket.handshake.auth.token as string

      if (!rawToken) {
        logger.warn("Socket connection attempted without a token.")
        return next(new Error("Authentication error: No token provided."))
      }
      // If header format is "Bearer <token>", strip the "Bearer " prefix
      const token = rawToken.startsWith("Bearer ")
        ? rawToken.slice(7)
        : rawToken

      // VERIFY the JWT
      const decoded = await AuthService.verifyToken(token)
      if (!decoded.userId) {
        throw new Error("Invalid token payload")
      }

      // Attach user data to the socket instance
      socket.data.user = { id: decoded.userId, role: decoded.role }
      next()
    } catch (error) {
      logger.error(`Socket authentication failed: ${(error as Error).message}`)
      next(new Error("Authentication error: Invalid token."))
    }
  })

  /**
   * @desc    Handles new socket connections (authenticated users only).
   */
  io.on("connection", async (socket: Socket) => {
    const { id: userId } = socket.data.user as { id: string; role: string }
    logger.info(`󰴽  User connected: ${userId}`)

    // Set user as online
    await User.findById(userId).then((user) => {
      if (user) {
        user.setOnline()
      }
    })

    io.emit(USER_ONLINE, userId)

    // Set up socket handlers for different features
    groupSocket(io, socket)
    dmSocket(io, socket)

    socket.on("disconnect", async (reason) => {
      logger.info(`  User disconnected: ${userId}, Reason: ${reason}`)

      // Set user as offline
      await User.findById(userId).then((user) => {
        if (user) {
          user.setOffline()
        }
      })

      socket.broadcast.emit(USER_OFFLINE, userId)
    })
  })

  return { io }
}

export { socketServer }
export default socketServer
