"use client"

import type { Socket } from "socket.io-client"

import { JOIN_ROOM, LEAVE_ROOM } from "@ab/shared/socket-events"
import React, {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"
import { io } from "socket.io-client"

import type { AnonymousUser } from "@/api/military-support/anonymous-military-chat-api"

import { generateAnonymousUser } from "@/api/military-support/anonymous-military-chat-api"

interface AnonymousMilitaryChatSocketContextType {
  socket: Socket | null
  isConnecting: boolean
  isConnected: boolean
  joinedRooms: Set<string>
  joinRoom: (room: string, event?: string) => void
  leaveRoom: (room: string, event?: string) => void
  user: AnonymousUser | null
}

const AnonymousMilitaryChatSocketContext =
  createContext<AnonymousMilitaryChatSocketContextType>({
    socket: null,
    isConnecting: false,
    isConnected: false,
    joinedRooms: new Set(),
    joinRoom: () => {},
    leaveRoom: () => {},
    user: null,
  })

export function useAnonymousMilitaryChatSocket() {
  const context = use(AnonymousMilitaryChatSocketContext)
  if (!context) {
    throw new Error(
      "useAnonymousMilitaryChatSocket must be used within a AnonymousMilitaryChatSocketProvider",
    )
  }
  return context
}

interface AnonymousMilitaryChatSocketProviderProps {
  children: React.ReactNode
}

export const AnonymousMilitaryChatSocketProvider: React.FC<
  AnonymousMilitaryChatSocketProviderProps
> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [joinedRooms, setJoinedRooms] = useState<Set<string>>(() => new Set())
  const [user, setUser] = useState<AnonymousUser | null>(null)

  useEffect(() => {
    // Clean up existing socket first
    if (socket) {
      socket.close()
    }

    const sessionId = localStorage.getItem("ab_military-session")
    const displayName = localStorage.getItem("ab_military-display-name")
    const user = generateAnonymousUser(
      sessionId || undefined,
      displayName || undefined,
    )
    localStorage.setItem("ab_military-session", user.sessionId)
    localStorage.setItem("ab_military-display-name", user.displayName)

    // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
    setUser(user)

    // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
    setIsConnecting(true)

    // Connect to anonymous Socket.IO namespace
    const newSocket = io(`/anonymous-military-chat`, {
      addTrailingSlash: false,
      timeout: 10_000,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      auth: {
        sessionId: user.sessionId,
        displayName: user.displayName,
      },
    })

    newSocket.on("connect", () => {
      setIsConnected(true)
      setIsConnecting(false)
    })

    newSocket.on("disconnect", (reason) => {
      console.warn("⚠️ Socket disconnected:", reason)
      setIsConnected(false)
      setIsConnecting(false)
    })

    newSocket.on("connect_error", (error) => {
      console.error("🔥 Socket connection error:", error)
      setIsConnected(false)
      setIsConnecting(false)
    })

    // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const joinRoom = useCallback(
    (room: string, event = JOIN_ROOM) => {
      if (socket && isConnected) {
        setJoinedRooms((prev) => new Set(prev).add(room))
        socket.emit(event, {
          room,
          sessionId: user?.sessionId,
          displayName: user?.displayName,
        })
      }
    },
    [socket, isConnected, user],
  )

  const leaveRoom = useCallback(
    (room: string, event = LEAVE_ROOM) => {
      if (socket && isConnected) {
        setJoinedRooms((prev) => {
          const updated = new Set(prev)
          updated.delete(room)
          return updated
        })
        socket.emit(event, { room })
      }
    },
    [socket, isConnected],
  )

  const contextValue = useMemo(
    () => ({
      socket,
      isConnecting,
      isConnected,
      joinedRooms,
      joinRoom,
      leaveRoom,
      user,
    }),
    [socket, isConnected, joinedRooms, joinRoom, leaveRoom, user, isConnecting],
  )

  return (
    <AnonymousMilitaryChatSocketContext value={contextValue}>
      {children}
    </AnonymousMilitaryChatSocketContext>
  )
}
