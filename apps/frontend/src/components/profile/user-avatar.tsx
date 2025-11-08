"use client"

import { USER_OFFLINE, USER_ONLINE } from "@ab/shared/socket-events"
import Image from "next/image"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { useSocket } from "@/context/auth/socket-context"
import { cn } from "@/lib/utils"

type AvatarSize = "sm" | "md" | "lg"
interface UserAvatarProps {
  userId: string
  /** The source URL for the avatar image */
  src?: string
  /** User's current status */
  status?: "online" | "offline"
  /** Pixel size (number) or preset ('sm'|'md'|'lg') */
  size?: AvatarSize
  /** Alternative text for screen readers */
  alt?: string
  /** Additional CSS classes */
  className?: string
  /** Additional CSS classes for the container */
  containerClassName?: string
}

const sizeMap: Record<"sm" | "md" | "lg", number> = {
  sm: 36,
  md: 48,
  lg: 60,
}

export function UserAvatar({
  userId,
  src,
  size = "md",
  status,
  alt,
  className,
  containerClassName,
}: UserAvatarProps) {
  const [isOnline, setIsOnline] = useState(() => status === "online")

  const { socket, isConnected } = useSocket()

  useEffect(
    () => {
      if (!socket || !isConnected || !userId) {
        return
      }

      const handleUserOnline = (onlineUserId: string) => {
        if (onlineUserId === userId) {
          setIsOnline(true)
        }
      }

      const handleUserOffline = (offlineUserId: string) => {
        if (offlineUserId === userId) {
          setIsOnline(false)
        }
      }

      const handleSocketError = (error: any) => {
        console.error("❌ Socket error:", error)
        toast.error("Connection error. Please try again.", {
          description:
            error.message ||
            "An unknown error occurred while connecting to chat",
        })
      }

      socket.on(USER_ONLINE, handleUserOnline)
      socket.on(USER_OFFLINE, handleUserOffline)
      socket.on("error", handleSocketError)

      // Cleanup function
      return () => {
        socket.off(USER_ONLINE, handleUserOnline)
        socket.off(USER_OFFLINE, handleUserOffline)
        socket.off("error", handleSocketError)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isConnected, userId],
  )

  return (
    <div className={cn("relative inline-block", containerClassName)}>
      <Image
        src={src || "/default-avatar.svg"}
        alt={alt || "User Avatar"}
        className={cn(
          `rounded-full border-2 border-background object-cover`,
          {
            "size-9": size === "sm",
            "size-12": size === "md",
            "size-15": size === "lg",
          },
          className,
        )}
        width={typeof size === "number" ? size : sizeMap[size]}
        height={typeof size === "number" ? size : sizeMap[size]}
      />
      <span
        className={cn(
          `
            absolute top-full right-0 block -translate-y-full rounded-full
            border-2 border-background
          `,
          {
            "size-3": size === "sm",
            "size-3.5": size === "md",
            "size-4": size === "lg",
            "bg-primary": isOnline,
            "bg-muted": !isOnline,
          },
        )}
      />
    </div>
  )
}
