import type { Server, Socket } from "socket.io"

import {
  CRISIS_ALERT,
  JOIN_ROOM,
  JOINED_SUCCESSFULLY,
  LEAVE_ROOM,
  NEW_MESSAGE,
  SEND_MESSAGE,
  USER_JOINED,
  USER_LEFT,
} from "@ab/shared/socket-events"

import {
  AnonymousMilitaryMessage,
  AnonymousSession,
} from "../api/models/AnonymousMilitaryChat.js"
import { logger } from "../utils/winston-logger.js"

interface AnonymousUser {
  sessionId: string
  displayName: string
  roomId?: string
}

export function setupAnonymousMilitaryChat(io: Server) {
  // Create anonymous military chat namespace (no auth required)
  const anonymousChatNamespace = io.of("/anonymous-military-chat")

  anonymousChatNamespace.on("connection", (socket: Socket) => {
    logger.info(`👋 Anonymous user connected: ${socket.id}`)

    const user: AnonymousUser = {
      sessionId: socket.handshake.auth.sessionId || socket.id,
      displayName: socket.handshake.auth.displayName || "Anonymous User",
    }

    // Handle joining a room
    socket.on(
      JOIN_ROOM,
      async (data: {
        room: string
        sessionId: string
        displayName: string
      }) => {
        const { room, sessionId, displayName } = data

        logger.info(`👥 Anonymous user ${displayName} joining room: ${room}`)

        // Join the Socket.IO room
        await socket.join(room)
        user.roomId = room
        user.sessionId = sessionId
        user.displayName = displayName

        await AnonymousSession.findOneAndUpdate(
          { sessionId },
          {
            $set: {
              displayName,
              room,
              lastActive: new Date(),
            },
          },
          {
            upsert: true, // Create a new session if it doesn't exist
            new: true,
            setDefaultsOnInsert: true,
          },
        )

        const memberCount = await AnonymousSession.getActiveSessionsInRoom(room)

        // Notify user they joined successfully
        socket.emit(JOINED_SUCCESSFULLY, { memberCount })

        // Notify room about new member
        socket.to(room).emit(USER_JOINED, {
          message: `${displayName} joined the room`,
          memberCount,
        })

        logger.info(`📊 Anonymous room ${room} now has ${memberCount} members`)
      },
    )

    // Handle sending messages
    socket.on(
      SEND_MESSAGE,
      async (data: {
        room: string
        message: string
        sessionId: string
        displayName: string
      }) => {
        const { room, message, displayName, sessionId } = data
        logger.info(
          `💬 Anonymous message from ${displayName} in ${room}: ${message}`,
        )

        // Check for crisis keywords
        // @keep-sorted
        const crisisKeywords = [
          "better off dead",
          "burden",
          "can't go on",
          "can't sleep",
          "cut myself",
          "cutting myself",
          "die",
          "drinking too much",
          "dying",
          "end it all",
          "ending it all",
          "failed again",
          "flashbacks",
          "give up",
          "giving up",
          "gun",
          "hanging",
          "harm myself",
          "hopeless",
          "hurt myself",
          "hurting myself",
          "isolating",
          "jump off",
          "kill myself",
          "killing myself",
          "mess up everything",
          "nightmares",
          "no one cares",
          "no point living",
          "overdose",
          "pills",
          "ptsd",
          "self harm",
          "shoot myself",
          "substance abuse",
          "suicidal",
          "suicide",
          "useless",
          "wanna die",
          "want to die",
          "wish I was dead",
          "worthless",
        ]
        const messageContainsCrisisKeywords = crisisKeywords.some((keyword) =>
          message.toLowerCase().includes(keyword),
        )

        if (messageContainsCrisisKeywords) {
          logger.warn(
            `🚨 Crisis keywords detected from ${displayName} in ${room}`,
          )

          // Send crisis resources to the user
          socket.emit(CRISIS_ALERT, {
            message:
              "We noticed you might be in distress. Please reach out for help: Veterans Crisis Line 988 (Press 1) or emergency services 911.",
            resources: {
              veteransCrisis: "988",
              emergency: "911",
              textLine: "838255",
            },
          })
        }

        const messageData = await AnonymousMilitaryMessage.create({
          anonymousSessionId: sessionId,
          displayName,
          room,
          message: message.trim(),
          isFlagged: messageContainsCrisisKeywords,
        })

        const messagePayload = {
          _id: messageData._id,
          displayName: messageData.displayName,
          message: messageData.message,
          isFlagged: messageData.isFlagged,
          createdAt: messageData.createdAt,
        }

        // Send message to everyone in the room
        anonymousChatNamespace.to(room).emit(NEW_MESSAGE, messagePayload)
      },
    )

    // Handle leaving room
    socket.on(
      LEAVE_ROOM,
      async (data: {
        room: string
        sessionId: string
        displayName: string
      }) => {
        const { room, sessionId, displayName } = data

        logger.info(`👋 Anonymous user ${displayName} leaving room: ${room}`)

        try {
          await socket.leave(room)
        } catch (error) {
          logger.error(`Error leaving room: ${error}`)
        }

        await AnonymousSession.deleteOne({ sessionId }).exec()

        const memberCount = await AnonymousSession.getActiveSessionsInRoom(room)

        // Notify room about user leaving
        socket.to(room).emit(USER_LEFT, {
          message: `${displayName} left the room`,
          memberCount,
        })
      },
    )

    // Handle disconnect
    socket.on("disconnect", async () => {
      logger.info(`❌ Anonymous user disconnected: ${socket.id}`)

      if (user.roomId) {
        await AnonymousSession.deleteOne({ sessionId: user.sessionId })
          .exec()
          .catch((error) => {
            logger.error(`Error deleting session on disconnect: ${error}`)
          })
      }
    })
  })

  logger.info("💬 Anonymous military chat namespace initialized")
}
