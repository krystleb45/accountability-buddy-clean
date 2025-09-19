"use client"

import { useQuery } from "@tanstack/react-query"
import {
  ArrowLeft,
  ArrowRight,
  Handshake,
  HexagonIcon,
  MessageSquareDotIcon,
  MessageSquareIcon,
  MessageSquareOff,
  SearchIcon,
  UserRoundCheckIcon,
  Users2,
  UsersRoundIcon,
  XCircle,
} from "lucide-react"
import { motion } from "motion/react"
import { useSession } from "next-auth/react"
import Link from "next/link"

import {
  fetchCommunityStats,
  fetchOnlineFriends,
  fetchRecentMessages,
} from "@/api/community/community-api"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function CommunityClient() {
  const { status } = useSession()

  const {
    data: stats,
    isPending: isStatsPending,
    error: statsError,
  } = useQuery({
    queryKey: ["communityStats"],
    queryFn: fetchCommunityStats,
    enabled: status === "authenticated",
  })

  const {
    data: recentMessages,
    isPending: isMessagesPending,
    error: messagesError,
  } = useQuery({
    queryKey: ["recentMessages", 5],
    queryFn: () => fetchRecentMessages(5),
    enabled: status === "authenticated",
  })

  const {
    data: onlineFriends,
    isPending: isFriendsPending,
    error: friendsError,
  } = useQuery({
    queryKey: ["onlineFriends", 5],
    queryFn: () => fetchOnlineFriends(5),
    enabled: status === "authenticated",
  })

  const isLoading =
    (status === "authenticated" &&
      (isStatsPending || isMessagesPending || isFriendsPending)) ||
    status === "loading"

  const error =
    statsError?.message || messagesError?.message || friendsError?.message

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
          <p className="mb-2">There was an error loading community details.</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  if (!stats || !recentMessages || !onlineFriends) {
    return null
  }

  return (
    <main className="flex flex-col gap-6">
      <Button variant="link" size="sm" asChild className="self-start !px-0">
        <Link href="/dashboard">
          <ArrowLeft /> Back to Dashboard
        </Link>
      </Button>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <Handshake size={36} className="text-primary" /> Community Hub
          </h1>
          <p className="text-muted-foreground">
            Connect, collaborate, and stay accountable together
          </p>
        </div>
        <Button asChild>
          <Link href="/community/discover">
            <SearchIcon />
            Discover
          </Link>
        </Button>
      </div>

      {/* Stats Bar */}
      <div
        className={`
          grid grid-cols-1 gap-6
          md:grid-cols-3
        `}
      >
        <Card>
          <CardHeader>
            <CardTitle>Friends</CardTitle>
            <CardAction>
              <Users2 className="text-chart-3" />
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums">
              {stats.totalFriends}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              asChild
              size="sm"
              className={`
                flex h-auto w-full justify-between py-1.5 wrap-break-word
              `}
            >
              <Link href="/friends">
                <span className="text-pretty">
                  Connect with accountability buddies
                </span>{" "}
                <ArrowRight className="shrink-0 text-chart-3" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Groups</CardTitle>
            <CardAction>
              <HexagonIcon className="text-chart-2" />
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums">
              {stats.activeGroups}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              asChild
              size="sm"
              className={`
                flex h-auto w-full justify-between py-1.5 wrap-break-word
              `}
            >
              <Link href="/community/groups">
                <span className="text-pretty">
                  Explore goal-focused communities
                </span>{" "}
                <ArrowRight className="shrink-0 text-chart-2" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Unread Messages</CardTitle>
            <CardAction>
              <MessageSquareDotIcon className="text-chart-4" />
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums">
              {stats.unreadMessages}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              asChild
              size="sm"
              className={`
                flex h-auto w-full justify-between py-1.5 wrap-break-word
              `}
            >
              <Link href="/messages">
                <span className="text-pretty">
                  Check your latest conversations
                </span>{" "}
                <ArrowRight className="shrink-0 text-chart-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <div
        className={`
          grid grid-cols-1 gap-6
          lg:grid-cols-2
        `}
      >
        {/* Recent Messages */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquareIcon className="text-chart-4" /> Recent Messages
              </CardTitle>
              {stats.unreadMessages > 0 && (
                <CardAction>
                  <Badge
                    variant="destructive"
                    className="h-5 min-w-5 rounded-full px-1 tabular-nums"
                  >
                    {stats.unreadMessages}
                  </Badge>
                </CardAction>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentMessages.length > 0 ? (
                  recentMessages.map((message) => (
                    <div
                      key={message._id}
                      className={`
                        flex items-center space-x-3 rounded-lg bg-gray-700 p-3
                      `}
                    >
                      <div
                        className={`
                          flex size-8 items-center justify-center rounded-full
                          bg-blue-500 text-sm font-bold
                        `}
                      >
                        {message.senderId.profileImage ? (
                          <img
                            src={message.senderId.profileImage}
                            alt={message.senderId.name}
                            className="size-8 rounded-full"
                          />
                        ) : (
                          (message.senderId.name || "U").charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          {message.messageType === "private" &&
                          message.senderId.name
                            ? message.senderId.name
                            : null}
                        </div>
                        <div className="truncate text-xs text-gray-400">
                          {message.text}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(message.updatedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    <div className="mb-2">
                      <MessageSquareOff className="mx-auto size-10" />
                    </div>
                    <p>No recent messages</p>
                    <p className="mt-1 text-sm">Start chatting with friends!</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="secondary" asChild size="sm">
                <Link href="/messages">
                  View All Messages <ArrowRight className="text-chart-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Online Friends */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserRoundCheckIcon className="text-primary" /> Online Friends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {onlineFriends.count > 0 ? (
                  onlineFriends.friends.map((friend) => (
                    <div
                      key={friend._id}
                      className={`
                        flex items-center space-x-3 rounded-lg bg-gray-700 p-3
                      `}
                    >
                      <div className="relative">
                        <div
                          className={`
                            flex size-8 items-center justify-center rounded-full
                            bg-purple-500 text-sm font-bold
                          `}
                        >
                          {friend.avatar ? (
                            <img
                              src={friend.avatar}
                              alt={friend.name || "Friend"}
                              className="size-8 rounded-full"
                            />
                          ) : (
                            (friend.name || "U").charAt(0).toUpperCase()
                          )}
                        </div>
                        <div
                          className={`
                            absolute -right-1 -bottom-1 size-3 rounded-full
                            border-2 border-gray-700 bg-green-400
                          `}
                        ></div>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          {friend.name || "Unknown User"}
                        </div>
                        <div className="text-xs text-gray-400">
                          {friend.status || "Online"}
                        </div>
                      </div>
                      <button
                        className={`
                          rounded-full bg-blue-600 px-3 py-1 text-xs
                          hover:bg-blue-700
                        `}
                      >
                        Chat
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    <div className="mb-2">
                      <UsersRoundIcon className="mx-auto size-10" />
                    </div>
                    <p>No friends online</p>
                    <p className="mt-1 text-sm">Invite friends to join!</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="secondary" asChild size="sm">
                <Link href="/friends">
                  View All Friends <ArrowRight className="text-chart-1" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </main>
  )
}
