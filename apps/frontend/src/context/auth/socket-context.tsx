"use client"

import type { Socket } from "socket.io-client"

import { useSession } from "next-auth/react"
import React, {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"
import { io } from "socket.io-client"

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  joinedRooms: Set<string>
  joinRoom: (roomId: string, event?: string) => void
  leaveRoom: (roomId: string, event?: string) => void
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  joinedRooms: new Set(),
  joinRoom: () => {},
  leaveRoom: () => {},
})

export function useSocket() {
  const context = use(SocketContext)
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider")
  }
  return context
}

interface SocketProviderProps {
  children: React.ReactNode
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { data: session, status } = useSession()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [joinedRooms, setJoinedRooms] = useState<Set<string>>(() => new Set())

  useEffect(() => {
    // Clean up existing socket first
    if (socket) {
      socket.close()
    }

    if (status !== "authenticated") {
      // If user is not authenticated or session is invalid, reset state
      // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
      setSocket(null)
      // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
      setIsConnected(false)
      // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
      setJoinedRooms(new Set())
      return
    }

    // Connect to your main Socket.IO namespace (not anonymous)
    const newSocket = io(`/`, {
      addTrailingSlash: false,
      timeout: 10_000,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      auth: {
        token: session.user.accessToken,
      },
    })

    newSocket.on("connect", () => {
      setIsConnected(true)
    })

    newSocket.on("disconnect", (reason) => {
      console.warn("⚠️ Socket disconnected:", reason)
      setIsConnected(false)
    })

    newSocket.on("connect_error", (error) => {
      console.error("🔥 Socket connection error:", error)
      setIsConnected(false)
    })

    // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  const joinRoom = useCallback(
    (roomId: string, event = "joinRoom") => {
      if (socket && isConnected) {
        setJoinedRooms((prev) => new Set(prev).add(roomId))
        socket.emit(event, { roomId })
      }
    },
    [socket, isConnected],
  )

  const leaveRoom = useCallback(
    (roomId: string, event = "leaveRoom") => {
      if (socket && isConnected) {
        setJoinedRooms((prev) => {
          const updated = new Set(prev)
          updated.delete(roomId)
          return updated
        })
        socket.emit(event, { roomId })
      }
    },
    [socket, isConnected],
  )

  const contextValue = useMemo(
    () => ({
      socket,
      isConnected,
      joinedRooms,
      joinRoom,
      leaveRoom,
    }),
    [socket, isConnected, joinedRooms, joinRoom, leaveRoom],
  )

  return <SocketContext value={contextValue}>{children}</SocketContext>
}
