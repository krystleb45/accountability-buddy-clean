import type { Server as HttpServer } from "node:http"
import type { Socket } from "socket.io"

import { Server } from "socket.io"

import AuthService from "../api/services/AuthService"
import { logger } from "../utils/winstonLogger"
import groupSocket from "./groups"

function socketServer(server: HttpServer) {
  const io = new Server(server, {
    addTrailingSlash: false,
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
      credentials: true,
    },
  })

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
  io.on("connection", (socket: Socket) => {
    const { id: userId } = socket.data.user as { id: string; role: string }
    logger.info(`User connected: ${userId}`)

    // Set up socket handlers for different features
    groupSocket(io, socket)
  })

  return { io }
}

export default socketServer
