"use client"

import {
  JOIN_DM_ROOM,
  LEAVE_DM_ROOM,
  NEW_DM_MESSAGE,
} from "@ab/shared/socket-events"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { format, formatDistanceToNow } from "date-fns"
import {
  ArrowLeft,
  ArrowRightIcon,
  ChevronRight,
  MessageSquareOffIcon,
  MessagesSquare,
  SearchIcon,
  SendIcon,
} from "lucide-react"
import { motion } from "framer-motion"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"

import type { DmMessage } from "@/api/friends/friend-api"

import {
  fetchDirectMessages,
  fetchFriends,
  sendDirectMessage,
} from "@/api/friends/friend-api"
import { getMemberByUsername } from "@/api/users/user-api"
import { LoadingSpinner } from "@/components/loading-spinner"
import { UserAvatar } from "@/components/profile/user-avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useSocket } from "@/context/auth/socket-context"
import { useSubscription } from "@/hooks/useSubscription"
import { cn } from "@/lib/utils"

const MotionItem = motion.create(Item)

const messageFormSchema = z.object({
  content: z.string().min(1, "Message cannot be empty").max(1000).trim(),
})

type MessageFormData = z.infer<typeof messageFormSchema>

export default function AdvancedMessagesClient() {
  const { data: session, status } = useSession()
  const userId = session?.user?.id
  const { hasDMMessaging } = useSubscription()
  const searchParams = useSearchParams()
  const friendUsername = searchParams.get("friend")

  const [friendSearch, setFriendSearch] = useState("")
  const [messages, setMessages] = useState<DmMessage[]>([])

  const {
    data: friends,
    isLoading: friendsLoading,
    error: friendsError,
  } = useQuery({
    queryKey: ["friends"],
    queryFn: fetchFriends,
    enabled: status === "authenticated" && hasDMMessaging,
    select: (data) => data.filter((f) => f.canDm),
  })

  const {
    data: friend,
    isLoading: friendLoading,
    error: friendError,
  } = useQuery({
    queryKey: ["member", friendUsername],
    queryFn: async () => {
      return getMemberByUsername(friendUsername!)
    },
    enabled: status === "authenticated" && !!friendUsername && hasDMMessaging, // Only run the query if friend is provided
  })

  const {
    data: queryMessagesAndChat,
    isLoading: messagesLoading,
    error: messagesError,
  } = useQuery({
    queryKey: ["messages", friendUsername],
    queryFn: async () => {
      return fetchDirectMessages(friend!._id)
    },
    enabled: status === "authenticated" && hasDMMessaging && !!friend,
  })

  useEffect(() => {
    if (queryMessagesAndChat) {
      // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
      setMessages((prev) => {
        // Merge new messages with existing ones, avoiding duplicates
        const messageMap = new Map(prev.map((msg) => [msg._id, msg]))
        queryMessagesAndChat.messages.messages.forEach((msg) =>
          messageMap.set(msg._id, msg),
        )
        return Array.from(messageMap.values()).sort(
          (a, b) =>
            new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime(),
        )
      })
    }
  }, [queryMessagesAndChat])

  const chatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }, [messages])

  const { socket, isConnected, joinedRooms, joinRoom, leaveRoom } = useSocket()

  useEffect(
    () => {
      const chatId = queryMessagesAndChat?.chat._id
      if (!socket || !isConnected || !chatId) {
        return
      }

      if (!joinedRooms.has(chatId)) {
        joinRoom(chatId, JOIN_DM_ROOM)
      }

      // Listen for new messages
      const handleNewMessage = (messageData: DmMessage) => {
        setMessages((prev) => {
          // Avoid duplicate messages
          if (prev.some((msg) => msg._id === messageData._id)) {
            return prev
          }
          return [...prev, messageData]
        })
      }

      const handleSocketError = (error: any) => {
        console.error("❌ Socket error:", error)
        toast.error("Connection error. Please try again.", {
          description:
            error.message ||
            "An unknown error occurred while connecting to chat",
        })
      }

      // Register event listeners
      socket.on(NEW_DM_MESSAGE, handleNewMessage)
      socket.on("error", handleSocketError)

      // Cleanup function
      return () => {
        socket.off(NEW_DM_MESSAGE, handleNewMessage)
        socket.off("error", handleSocketError)

        // Leave the room when component unmounts
        leaveRoom(chatId, LEAVE_DM_ROOM)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isConnected, queryMessagesAndChat?.chat._id],
  )

  const form = useForm({
    resolver: zodResolver(messageFormSchema),
    defaultValues: {
      content: "",
    },
  })

  const queryClient = useQueryClient()

  const { mutate: sendMessageMutate, isPending: isSending } = useMutation({
    mutationFn: async (data: MessageFormData) => {
      return sendDirectMessage(friend!._id, data.content)
    },
    onSuccess: () => {
      // Clear the input field
      form.reset()
      queryClient.invalidateQueries({ queryKey: ["messages", friendUsername] })
    },
    onError: (error) => {
      toast.error("Failed to send message. Please try again.", {
        description:
          error.message || "An unknown error occurred while sending message",
      })
    },
  })

  const sendMessage = async (data: MessageFormData) => {
    if (isSending) {
      return // Prevent multiple submissions
    }
    sendMessageMutate(data)
  }

  const filteredFriends = (friends || []).filter((f) =>
    (f?.name || f?.username || "").toLowerCase().includes(friendSearch.toLowerCase()),
  )

  if (!hasDMMessaging) {
    return (
      <main className="flex min-h-screen flex-col gap-6">
        <Button variant="link" size="sm" asChild className="self-start !px-0">
          <Link href="/community">
            <ArrowLeft /> Back to Community
          </Link>
        </Button>

        <div className="grid flex-1 place-items-center">
          <Empty>
            <EmptyHeader>
              <EmptyMedia>
                <MessageSquareOffIcon size={48} className="text-destructive" />
              </EmptyMedia>
              <EmptyDescription>
                You need a Pro or higher subscription to use Direct Messages
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button asChild>
                <Link href="/subscription">
                  Upgrade your subscription <ArrowRightIcon />
                </Link>
              </Button>
            </EmptyContent>
          </Empty>
        </div>
      </main>
    )
  }

  return (
    <section className="flex flex-1 flex-col gap-6">
      <Button variant="link" size="sm" asChild className="self-start !px-0">
        <Link href="/community">
          <ArrowLeft /> Back to Community
        </Link>
      </Button>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-3xl font-bold">
          <MessagesSquare size={36} className="text-primary" /> Direct Messages
        </h1>
      </div>

      <Card className="flex-1 flex-row gap-0 p-0">
        {/* Friends List */}
        <div className="flex basis-1/3 flex-col gap-3 border-r p-6">
          <p>Your Friends</p>
          <p className="text-sm text-pretty text-muted-foreground">
            Only those who can receive direct messages are shown.
          </p>
          {friends && friends.length > 5 && (
            <InputGroup className="mb-2">
              <InputGroupInput
                placeholder="Search friends..."
                value={friendSearch}
                onChange={(e) => setFriendSearch(e.target.value)}
              />
              <InputGroupAddon>
                <SearchIcon />
              </InputGroupAddon>
            </InputGroup>
          )}
          {friendsLoading ? (
            <div className="grid place-items-center p-6">
              <LoadingSpinner />
            </div>
          ) : friendsError ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle className="text-destructive">
                  Error loading friends
                </EmptyTitle>
                <EmptyDescription>{friendsError.message}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : filteredFriends?.length ? (
            <div className="flex flex-col gap-3 overflow-y-auto">
              {filteredFriends.map((friend) => (
                <Item
                  key={friend._id}
                  variant="muted"
                  asChild
                  className={cn("border border-transparent", {
                    "border-primary": friend.username === friendUsername,
                  })}
                >
                  <Link href={`/messages?friend=${friend.username}`}>
                    <ItemMedia>
                      <UserAvatar
                        userId={friend._id}
                        src={friend.profileImage}
                        alt={friend.name || friend.username}
                        status={
                          friend.activeStatus === "online"
                            ? "online"
                            : "offline"
                        }
                      />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>{friend.name || friend.username}</ItemTitle>
                      <ItemDescription>@{friend.username}</ItemDescription>
                    </ItemContent>
                    <ItemActions>
                      <ChevronRight />
                    </ItemActions>
                  </Link>
                </Item>
              ))}
            </div>
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>
                  {friends?.length === 0
                    ? "No friends yet"
                    : "No matching friends"}
                </EmptyTitle>
                {friends?.length === 0 && (
                  <EmptyDescription>
                    You haven't added any friends
                  </EmptyDescription>
                )}
              </EmptyHeader>
              <EmptyContent>
                {friends?.length === 0 ? (
                  <Button asChild size="sm" variant="secondary">
                    <Link href="/friends/discover">
                      <SearchIcon />
                      Find Friends
                    </Link>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFriendSearch("")}
                  >
                    Clear Search
                  </Button>
                )}
              </EmptyContent>
            </Empty>
          )}
        </div>
        {/* Main Chat Area */}
        <div className="flex-1">
          {!friendUsername ? (
            <div className="grid h-full place-items-center p-6 text-center">
              <Empty>
                <EmptyHeader>
                  <EmptyMedia>
                    <MessagesSquare size={48} className="text-primary" />
                  </EmptyMedia>
                  <EmptyTitle>Select a friend to start chatting</EmptyTitle>
                </EmptyHeader>
              </Empty>
            </div>
          ) : friendLoading ? (
            <div className="grid h-full place-items-center p-6">
              <LoadingSpinner />
            </div>
          ) : friendError ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle className="text-destructive">
                  Error loading friend details
                </EmptyTitle>
                <EmptyDescription>{friendError.message}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            !!friend && (
              <div className="flex h-full flex-col py-6">
                {/* Header */}
                <CardHeader
                  // prettier-ignore
                  className="flex flex-row items-center gap-4 border-b"
                >
                  <UserAvatar
                    userId={friend._id}
                    src={friend.profileImage}
                    alt={friend.username}
                    status={friend.activeStatus}
                  />
                  <div className="space-y-1">
                    <CardTitle>{friend.name || friend.username}</CardTitle>
                    <CardDescription className="hover:underline">
                      <Link href={`/member/${friend.username}`}>
                        @{friend.username}
                      </Link>
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent
                  ref={chatRef}
                  className={`
                    flex max-h-[75dvh] min-h-0 flex-1 flex-col gap-4
                    overflow-y-auto py-6
                  `}
                >
                  {messagesLoading ? (
                    <div className="grid h-full place-items-center p-6">
                      <LoadingSpinner />
                    </div>
                  ) : messagesError ? (
                    <Empty>
                      <EmptyHeader>
                        <EmptyTitle className="text-destructive">
                          Error loading messages
                        </EmptyTitle>
                        <EmptyDescription>
                          {messagesError.message}
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  ) : messages && messages.length > 0 ? (
                    <div className="flex flex-col gap-4">
                      {messages.map((message) => {
                        const isUserMessage = message.senderId._id === userId

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
                                className={cn("items-start gap-2 py-2", {
                                  "rounded-xl rounded-bl-none": !isUserMessage,
                                  "rounded-xl rounded-br-none border-primary":
                                    isUserMessage,
                                })}
                              >
                                <ItemContent>
                                  <p>{message.text}</p>
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
                      })}
                    </div>
                  ) : (
                    <div className="grid h-full place-items-center p-6">
                      <p className="text-center text-muted-foreground">
                        No messages yet. Start the conversation!
                      </p>
                    </div>
                  )}
                </CardContent>
                {/* Message Input */}
                <CardFooter className="mt-auto border-t">
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(sendMessage)}
                      className="flex flex-1 items-end gap-2"
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
                      <Button type="submit" disabled={isSending}>
                        <SendIcon /> {isSending ? "Sending..." : "Send"}
                      </Button>
                    </form>
                  </Form>
                </CardFooter>
              </div>
            )
          )}
        </div>
      </Card>
    </section>
  )
}
