"use client"

import {
  JOIN_GROUP_ROOM,
  LEAVE_GROUP_ROOM,
  NEW_GROUP_MESSAGE,
  USER_REMOVED_FROM_GROUP,
} from "@ab/shared/socket-events"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { format, formatDistanceToNow } from "date-fns"
import {
  ArrowLeft,
  CalendarPlus,
  CrownIcon,
  GlobeIcon,
  HexagonIcon,
  LockIcon,
  MessagesSquare,
  SendIcon,
  SettingsIcon,
  Users2,
  XCircle,
} from "lucide-react"
import { motion } from "framer-motion"
import { useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"

import type { GroupMessage } from "@/api/groups/group-api"

import {
  fetchGroupDetails,
  fetchGroupMembers,
  fetchGroupMessages,
  sendGroupMessage,
} from "@/api/groups/group-api"
import { MemberCard } from "@/components/group/member-card"
import { LoadingSpinner } from "@/components/loading-spinner"
import { UserAvatar } from "@/components/profile/user-avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Item, ItemContent, ItemTitle } from "@/components/ui/item"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useSocket } from "@/context/auth/socket-context"
import { cn } from "@/lib/utils"

const MotionItem = motion.create(Item)

interface GroupDetailClientProps {
  groupId: string
}

const messageFormSchema = z.object({
  content: z.string().min(1, "Message cannot be empty").max(1000).trim(),
})

type MessageFormData = z.infer<typeof messageFormSchema>

export default function GroupDetailClient({ groupId }: GroupDetailClientProps) {
  const { data: session, status } = useSession()
  const userId = session?.user?.id
  const queryClient = useQueryClient()
  const router = useRouter()

  const [messages, setMessages] = useState<GroupMessage[]>([])

  const {
    data: group,
    isLoading: isLoadingGroup,
    error: groupError,
  } = useQuery({
    queryKey: ["group", groupId],
    queryFn: async () => fetchGroupDetails(groupId),
    enabled: status === "authenticated" && !!groupId,
  })

  const {
    data: members,
    isLoading: isLoadingMembers,
    error: membersError,
  } = useQuery({
    queryKey: ["groupMembers", groupId],
    queryFn: async () => fetchGroupMembers(groupId),
    enabled: status === "authenticated" && !!groupId,
  })

  const {
    data: queryMessages,
    isLoading: isLoadingMessages,
    error: messagesError,
  } = useQuery({
    queryKey: ["groupMessages", groupId],
    queryFn: async () => fetchGroupMessages(groupId),
    enabled: status === "authenticated" && !!groupId,
    select: (data) => data.messages,
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

  const chatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }, [messages])

  const isLoading =
    status === "loading" ||
    isLoadingGroup ||
    isLoadingMembers ||
    isLoadingMessages

  const error =
    groupError?.message || membersError?.message || messagesError?.message

  const form = useForm({
    resolver: zodResolver(messageFormSchema),
    defaultValues: {
      content: "",
    },
  })

  const { socket, isConnected, joinedRooms, joinRoom, leaveRoom } = useSocket()

  useEffect(
    () => {
      if (!socket || !isConnected || !groupId) {
        return
      }

      if (!joinedRooms.has(groupId)) {
        joinRoom(groupId, JOIN_GROUP_ROOM)
      }

      // Listen for new messages
      const handleNewMessage = (messageData: GroupMessage) => {
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

      const handleMemberRemoved = (data: { userId: string }) => {
        if (data.userId === userId) {
          toast.error("You have been removed from the group.", {
            description:
              "You can no longer send or receive messages in this group.",
          })
          router.push("/community/groups")
          return
        }

        const username =
          members?.find((m) => m._id === data.userId)?.username || "A member"
        toast.info(`${username} has been removed from the group.`)
        queryClient.invalidateQueries({ queryKey: ["groupMembers", groupId] })
      }

      // Register event listeners
      socket.on(NEW_GROUP_MESSAGE, handleNewMessage)
      socket.on(USER_REMOVED_FROM_GROUP, handleMemberRemoved)
      socket.on("error", handleSocketError)

      // Cleanup function
      return () => {
        socket.off(NEW_GROUP_MESSAGE, handleNewMessage)
        socket.off(USER_REMOVED_FROM_GROUP, handleMemberRemoved)
        socket.off("error", handleSocketError)

        // Leave the room when component unmounts
        leaveRoom(groupId, LEAVE_GROUP_ROOM)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isConnected, groupId],
  )

  const { mutate: sendMessageMutate, isPending: isSending } = useMutation({
    mutationFn: async (data: MessageFormData) => {
      return sendGroupMessage(groupId, data.content)
    },
    onSuccess: () => {
      // Clear the input field
      form.reset()
      queryClient.invalidateQueries({ queryKey: ["groupMessages", groupId] })
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

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="text-center">
          <XCircle size={60} className="mx-auto mb-6 text-destructive" />
          <p className="mb-2">There was an error loading the group.</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="text-center">
          <XCircle size={60} className="mx-auto mb-6 text-destructive" />
          <p className="mb-2">Group not found.</p>
          <p className="text-sm text-muted-foreground">
            The group you are looking for does not exist or has been deleted.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <Button variant="link" size="sm" asChild className="self-start !px-0">
        <Link href="/community/groups">
          <ArrowLeft /> Back to Groups
        </Link>
      </Button>

      {/* Header */}
      <div
        className={`
          flex flex-col gap-4
          sm:flex-row sm:items-center sm:justify-between
        `}
      >
        <div className="flex items-center gap-4">
          {group.avatar ? (
            <Image
              src={group.avatar}
              alt={group.name}
              width={80}
              height={80}
              className={`
                size-20 shrink-0 overflow-hidden rounded-full border
                border-muted object-contain
              `}
            />
          ) : (
            <HexagonIcon className="size-20 text-primary" />
          )}
          <div>
            <h1 className="text-3xl font-bold">{group.name}</h1>
            {group.description && (
              <p className="text-sm text-muted-foreground">
                {group.description}
              </p>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="secondary">
                <Users2 />
                <span className="font-mono">{members?.length}</span>{" "}
                {members?.length === 1 ? "Member" : "Members"}
              </Badge>
              <Badge variant="secondary">
                {group.isPublic ? <GlobeIcon /> : <LockIcon />}{" "}
                {group.isPublic ? "Public" : "Private"}
              </Badge>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href={`/member/${group.createdBy.username}`}>
                    <Badge variant="secondary">
                      <CrownIcon /> @{group.createdBy.username}
                    </Badge>
                  </Link>
                </TooltipTrigger>

                <TooltipContent>
                  Created by @{group.createdBy.username}
                </TooltipContent>
              </Tooltip>
              {group.createdAt && (
                <Badge variant="secondary">
                  <CalendarPlus />
                  Created{" "}
                  {formatDistanceToNow(group.createdAt, { addSuffix: true })}
                </Badge>
              )}
            </div>
          </div>
        </div>
        {group.createdBy._id === userId && (
          <Button variant="outline" asChild>
            <Link href={`/community/groups/${groupId}/admin`}>
              <SettingsIcon className="text-primary" /> Manage Group
            </Link>
          </Button>
        )}
      </div>

      <div
        className={`
          grid flex-1 grid-cols-1 gap-6
          lg:grid-cols-4
        `}
      >
        {/* Messages Section */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            {/* Messages Header */}
            <CardHeader className="border-b">
              <CardTitle>
                <MessagesSquare className="mr-2 inline-block text-primary" />{" "}
                Chat
              </CardTitle>
            </CardHeader>

            {/* Messages List */}
            <CardContent
              className="max-h-[75dvh] flex-1 space-y-4 overflow-y-auto"
              ref={chatRef}
            >
              {messages.length > 0 ? (
                messages.map((message) => {
                  const isUserMessage = message.senderId._id === userId

                  return (
                    <div
                      key={message._id}
                      className={cn("flex", {
                        "justify-end": isUserMessage,
                      })}
                    >
                      <div>
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
                          <UserAvatar
                            userId={message.senderId._id}
                            src={message.senderId.profileImage}
                            alt={message.senderId.username}
                            status={message.senderId.activeStatus}
                            size="sm"
                            containerClassName="self-center"
                          />
                          <ItemContent>
                            <ItemTitle
                              className={`
                                w-full text-xs font-medium text-muted-foreground
                                hover:underline
                              `}
                            >
                              <Link
                                href={`/member/${message.senderId.username}`}
                              >
                                @{message.senderId.username}
                              </Link>
                            </ItemTitle>
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
                })
              ) : (
                <div className="flex flex-1 items-center justify-center">
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
          </Card>
        </div>

        {/* Members Section */}
        <div
          className={`
            sticky top-20 self-start
            lg:col-span-1
          `}
        >
          <Card>
            <CardHeader className="border-b">
              <CardTitle>
                <Users2 className="mr-2 inline-block text-primary" /> Members{" "}
                <span className="font-mono">({members?.length || 0})</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="max-h-[75dvh] space-y-4 overflow-y-auto">
              {members && members.length > 0 ? (
                members.map((member) => (
                  <MemberCard
                    key={member._id}
                    member={member}
                    isAdmin={member._id === group.createdBy._id}
                  />
                ))
              ) : (
                <p className="py-4 text-center text-muted-foreground">
                  No members found
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
