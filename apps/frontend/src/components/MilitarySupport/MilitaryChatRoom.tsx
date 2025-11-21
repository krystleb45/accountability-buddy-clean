"use client"

import {
  CRISIS_ALERT,
  JOINED_SUCCESSFULLY,
  NEW_MESSAGE,
  SEND_MESSAGE,
  USER_JOINED,
  USER_LEFT,
} from "@ab/shared/socket-events"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { format, formatDistanceToNow } from "date-fns"
import {
  AlertTriangle,
  ArrowLeft,
  SendIcon,
  Users,
  Wifi,
  WifiOff,
  XCircleIcon,
} from "lucide-react"
import { motion } from "motion/react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"

import type { AnonymousMessage } from "@/api/military-support/anonymous-military-chat-api"

import * as anonymousMilitaryChatApi from "@/api/military-support/anonymous-military-chat-api"
import { useAnonymousMilitaryChatSocket } from "@/context/anonymous-military-chat-socket-context"
import { cn } from "@/lib/utils"

import { LoadingSpinner } from "../loading-spinner"
import { Button } from "../ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card"
import { Form, FormControl, FormField, FormItem, FormMessage } from "../ui/form"
import { Input } from "../ui/input"
import { Item, ItemContent, ItemHeader, ItemTitle } from "../ui/item"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"

interface RoomDetails {
  name: string
  description: string
  icon: string
}

interface Props {
  roomId: string
  roomDetails: RoomDetails
}

const MotionItem = motion.create(Item)

const messageFormSchema = z.object({
  content: z.string().min(1, "Message cannot be empty").max(1000).trim(),
})

type MessageFormData = z.infer<typeof messageFormSchema>

export default function MilitaryChatRoom({ roomId, roomDetails }: Props) {
  const [messages, setMessages] = useState<AnonymousMessage[]>([])
  const [crisisResources, setCrisisResources] = useState<any | null>(null)
  const [onlineCount, setOnlineCount] = useState(0)

  const {
    socket,
    isConnecting,
    isConnected,
    joinedRooms,
    joinRoom,
    leaveRoom,
    user,
  } = useAnonymousMilitaryChatSocket()

  const {
    data: queryMessages,
    isLoading: messagesLoading,
    error: messagesError,
  } = useQuery({
    queryKey: ["miliary-support", "messages", roomId],
    queryFn: async () => {
      return anonymousMilitaryChatApi.getAnonymousMessages(roomId)
    },
    enabled: !!roomId,
  })

  useEffect(() => {
    if (queryMessages) {
      // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
      setMessages((prev) => {
        // Merge new messages with existing ones, avoiding duplicates
        const messageMap = new Map(prev.map((msg) => [msg._id, msg]))
        queryMessages.forEach((msg) => messageMap.set(msg._id, msg))
        return Array.from(messageMap.values()).sort(
          (a, b) =>
            new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime(),
        )
      })
    }
  }, [queryMessages])

  useEffect(() => {
    if (!socket || !isConnected || !roomId) {
      return
    }

    if (!joinedRooms.has(roomId)) {
      joinRoom(roomId)
    }

    const handleSuccessfulJoin = (data: { memberCount: number }) => {
      setOnlineCount(data.memberCount)
      toast.success(`Joined ${roomDetails.name} successfully!`)
    }

    // Listen for new messages
    const handleNewMessage = (messageData: AnonymousMessage) => {
      setMessages((prev) => {
        // Avoid duplicate messages
        if (prev.some((msg) => msg._id === messageData._id)) {
          return prev
        }
        return [...prev, messageData]
      })
    }

    const handleCrisisAlert = (data: { message: string; resources: any }) => {
      setCrisisResources({
        message: data.message,
        resources: data.resources,
      })
    }

    const handleUserJoined = (data: { memberCount: number }) => {
      setOnlineCount(data.memberCount)
    }

    const handleUserLeft = (data: { memberCount: number }) => {
      setOnlineCount(data.memberCount)
    }

    const handleSocketError = (error: any) => {
      console.error("❌ Socket error:", error)
      toast.error("Connection error. Please try again.", {
        description:
          error.message || "An unknown error occurred while connecting to chat",
      })
    }

    // Register event listeners
    socket.on(JOINED_SUCCESSFULLY, handleSuccessfulJoin)
    socket.on(NEW_MESSAGE, handleNewMessage)
    socket.on(CRISIS_ALERT, handleCrisisAlert)
    socket.on(USER_JOINED, handleUserJoined)
    socket.on(USER_LEFT, handleUserLeft)
    socket.on("error", handleSocketError)

    // Cleanup function
    return () => {
      socket.off(JOINED_SUCCESSFULLY, handleSuccessfulJoin)
      socket.off(NEW_MESSAGE, handleNewMessage)
      socket.off(CRISIS_ALERT, handleCrisisAlert)
      socket.off(USER_JOINED, handleUserJoined)
      socket.off(USER_LEFT, handleUserLeft)
      socket.off("error", handleSocketError)

      // Leave the room when component unmounts
      leaveRoom(roomId)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, roomId])

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const form = useForm({
    resolver: zodResolver(messageFormSchema),
    defaultValues: {
      content: "",
    },
  })

  const sendMessage = async (data: MessageFormData) => {
    if (!data.content.trim() || !user || !socket) {
      return
    }

    const messageText = data.content

    socket.emit(SEND_MESSAGE, {
      room: roomId,
      message: messageText,
      sessionId: user.sessionId,
      displayName: user.displayName,
    })

    form.reset()
  }

  // Handle page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      leaveRoom(roomId)
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      leaveRoom(roomId)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId])

  const loading = messagesLoading || isConnecting

  // Loading state
  if (loading) {
    return (
      <div className="my-80 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (messagesError || (!socket && !isConnecting)) {
    return (
      <div className="my-80 flex items-center justify-center">
        <div className="text-center">
          <XCircleIcon className="mx-auto size-20 text-destructive" />
          <h2 className="mt-2 text-xl font-bold text-destructive">
            Something went wrong
          </h2>
          {messagesError && (
            <p className="mt-2 text-sm text-muted-foreground">
              {messagesError.message}
            </p>
          )}
          <Button asChild className="mt-6" variant="outline">
            <Link href="/military-support/chat">
              <ArrowLeft />
              Back to Rooms
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <section className="flex flex-1 flex-col gap-6">
      <Button variant="link" size="sm" asChild className="self-start !px-0">
        <Link href="/military-support">
          <ArrowLeft /> Back to Military Support
        </Link>
      </Button>

      {/* Header */}
      <div className="flex items-center gap-2">
        <p className="text-3xl font-bold">{roomDetails.icon}</p>
        <div>
          <h1 className="text-2xl font-bold">{roomDetails.name}</h1>
          <div
            className={`
              flex items-center space-x-4 text-sm text-muted-foreground
            `}
          >
            <div className="flex items-center">
              <Users className="mr-1 size-4" />
              {onlineCount} online
            </div>
            <div className="flex items-center">
              {isConnected ? (
                <>
                  <Wifi className="mr-1 size-4 text-primary" />
                  <span className="text-primary">Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="mr-1 size-4 text-destructive" />
                  <span className="text-destructive">
                    {isConnecting ? "Connecting..." : "Disconnected"}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Crisis Resources Alert */}
      {crisisResources && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent>
            <p className="text-center text-balance text-destructive">
              {crisisResources.message}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Chat Messages */}
      <Card className="flex-1">
        <CardContent
          className={`
            flex max-h-[75svh] flex-1 flex-col space-y-4 overflow-y-auto
          `}
        >
          {/* No messages state */}
          {messages.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isUserMessage = message.displayName === user?.displayName

              return (
                <div
                  key={message._id}
                  className={cn("flex", {
                    "justify-end": isUserMessage,
                  })}
                >
                  <div className="max-w-4/5">
                    <MotionItem
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      variant="outline"
                      className={cn(`items-start gap-2 py-2`, {
                        "rounded-xl rounded-bl-none": !isUserMessage,
                        "rounded-xl rounded-br-none border-primary":
                          isUserMessage,
                      })}
                    >
                      <ItemHeader>
                        <ItemTitle className="text-xs text-muted-foreground">
                          {message.displayName}
                        </ItemTitle>
                      </ItemHeader>
                      <ItemContent>
                        <p>{message.message}</p>
                      </ItemContent>
                    </MotionItem>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p
                          className={cn(
                            `
                              mt-1 w-fit font-mono text-2xs
                              text-muted-foreground
                            `,
                            {
                              "ml-auto text-right": isUserMessage,
                            },
                          )}
                        >
                          {formatDistanceToNow(message.createdAt!, {
                            addSuffix: true,
                          })}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent
                        side="bottom"
                        align={isUserMessage ? "end" : "start"}
                      >
                        {format(message.createdAt!, "PPp")}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Message Input */}
        <CardFooter className="block border-t">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(sendMessage)}
              className="flex items-end gap-2"
            >
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        placeholder="Type your message..."
                        className="w-full"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">
                <SendIcon /> Send
              </Button>
            </form>
          </Form>
          <div className="mt-2 text-xs text-muted-foreground">
            <span>
              You're chatting as <strong>{user?.displayName}</strong> • Press
              Enter to send
            </span>
          </div>
        </CardFooter>
      </Card>

      {/* Safety Reminder */}
      <Card className="gap-4 border-chart-3 bg-chart-3/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-chart-3">
            <AlertTriangle className="size-5" /> Remember:
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="leading-relaxed text-pretty">
            This is peer support, not professional counseling. For crisis
            situations or thoughts of self-harm, please contact the Veterans
            Crisis Line at{" "}
            <strong>
              <a className="underline" href="tel:988">
                988 (Press 1)
              </a>
            </strong>{" "}
            or emergency services at{" "}
            <strong>
              <a className="underline" href="tel:911">
                911
              </a>
            </strong>
            .
          </p>
        </CardContent>
      </Card>
    </section>
  )
}
