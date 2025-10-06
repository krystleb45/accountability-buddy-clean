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
  joinRoom: (roomId: string, event?: string) => void
  leaveRoom: (roomId: string, event?: string) => void
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
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

  useEffect(() => {
    if (status !== "authenticated") {
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
  }, [session, status])

  const joinRoom = useCallback(
    (roomId: string, event = "joinRoom") => {
      if (socket && isConnected) {
        socket.emit(event, { roomId })
      }
    },
    [socket, isConnected],
  )

  const leaveRoom = useCallback(
    (roomId: string, event = "leaveRoom") => {
      if (socket && isConnected) {
        socket.emit(event, { roomId })
      }
    },
    [socket, isConnected],
  )

  const contextValue = useMemo(
    () => ({
      socket,
      isConnected,
      joinRoom,
      leaveRoom,
    }),
    [socket, isConnected, joinRoom, leaveRoom],
  )

  return <SocketContext value={contextValue}>{children}</SocketContext>
}
