// src/app/friends/page.client.tsx
"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  ArrowLeft,
  BellIcon,
  BellRingIcon,
  CheckIcon,
  Loader,
  MessageSquare,
  SearchIcon,
  Users2,
  XCircle,
  XIcon,
} from "lucide-react"
import { motion } from "motion/react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

import {
  acceptFriendRequest,
  declineFriendRequest,
  fetchFriendRequests,
  fetchFriends,
} from "@/api/friends/friend-api"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

export function FriendsClient() {
  const { status } = useSession()

  const [searchQuery, setSearchQuery] = useState("")
  const [loadingRequestIds, setLoadingRequestIds] = useState<string[]>([])

  const {
    data: friends,
    isLoading: friendsLoading,
    error: friendsError,
  } = useQuery({
    queryKey: ["friends"],
    queryFn: fetchFriends,
    enabled: status === "authenticated",
  })

  const {
    data: requests,
    isLoading: requestsLoading,
    error: requestsError,
  } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: fetchFriendRequests,
    enabled: status === "authenticated",
  })

  const isLoading = friendsLoading || requestsLoading
  const error = friendsError || requestsError || null

  const queryClient = useQueryClient()
  const { mutate: acceptRequest } = useMutation({
    mutationFn: (requestId: string) => acceptFriendRequest(requestId),
    onMutate: (requestId: string) => {
      setLoadingRequestIds((prev) => [...prev, requestId])
    },
    onSettled: (_, _e, requestId) => {
      setLoadingRequestIds((prev) => prev.filter((id) => id !== requestId))
    },
    onSuccess: () => {
      // Refetch friend requests and friends list after accepting
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] })
      queryClient.invalidateQueries({ queryKey: ["friends"] })
      toast.success("Friend request accepted", {
        description: "You can now chat with your new accountability buddy!",
      })
    },
    onError: (error) => {
      toast.error("Failed to accept friend request. Please try again.", {
        description: error.message,
      })
    },
  })

  const { mutate: declineRequest } = useMutation({
    mutationFn: (requestId: string) => declineFriendRequest(requestId),
    onMutate: (requestId: string) => {
      setLoadingRequestIds((prev) => [...prev, requestId])
    },
    onSettled: (_, _e, requestId) => {
      setLoadingRequestIds((prev) => prev.filter((id) => id !== requestId))
    },
    onSuccess: () => {
      // Refetch friend requests after declining
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] })
      toast.success("Friend request declined")
    },
    onError: (error) => {
      toast.error("Failed to decline friend request. Please try again.", {
        description: error.message,
      })
    },
  })

  const handleAcceptRequest = async (requestId: string) => {
    acceptRequest(requestId)
  }

  const handleRejectRequest = async (requestId: string) => {
    declineRequest(requestId)
  }

  const filteredFriends = (friends || []).filter((f) =>
    f?.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (status === "loading" || isLoading) {
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
          <p className="mb-2">There was an error loading your friends.</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    )
  }

  if (!friends || !requests) {
    return null
  }

  return (
    <main className="flex min-h-screen flex-col gap-6">
      <Button variant="link" size="sm" asChild className="self-start !px-0">
        <Link href="/community">
          <ArrowLeft /> Back to Community
        </Link>
      </Button>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-3xl font-bold">
          <Users2 size={36} className="text-primary" /> Friends
        </h1>
        {requests.length > 0 && (
          <div className="relative">
            <BellIcon className="size-8 text-chart-3" />
            <span
              className={`
                absolute top-0 right-0 grid h-5 min-w-5 translate-x-1/3
                -translate-y-1/2 place-items-center rounded-full bg-destructive
                text-xs font-bold
              `}
            >
              {requests.length}
            </span>
          </div>
        )}
      </div>

      {/* Friend Requests Section */}
      {requests.length > 0 && (
        <>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BellRingIcon className="text-yellow-400" />
                  Pending Friend Requests
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {requests.map((req) => (
                  <motion.div
                    key={req._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`
                      flex items-center justify-between rounded-lg bg-muted p-4
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <Image
                        src={req.sender.profileImage || "/default-avatar.svg"}
                        alt="Avatar"
                        className={`
                          size-12 rounded-full border-2 border-background
                          object-cover
                        `}
                        width={48}
                        height={48}
                      />
                      <div>
                        <p className="font-semibold">
                          <Button
                            variant="link"
                            asChild
                            className="!px-0 !py-0 text-base"
                          >
                            <Link href={`/member/${req.sender.username}`}>
                              {req.sender.name}
                            </Link>
                          </Button>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Wants to be your accountability buddy
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <Button
                        onClick={() => handleAcceptRequest(req._id)}
                        disabled={loadingRequestIds.includes(req._id)}
                      >
                        <CheckIcon />
                        Accept
                        {loadingRequestIds.includes(req._id) && (
                          <Loader className="animate-spin" />
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleRejectRequest(req._id)}
                        disabled={loadingRequestIds.includes(req._id)}
                      >
                        <XIcon />
                        Decline
                        {loadingRequestIds.includes(req._id) && (
                          <Loader className="animate-spin" />
                        )}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
          <Separator />
        </>
      )}

      {/* Friends List Section */}

      {/* Search */}
      <div className="relative w-full max-w-md">
        <SearchIcon
          className={`
            absolute top-1/2 left-3 size-4 -translate-y-1/2
            text-muted-foreground
          `}
        />
        <Input
          type="search"
          placeholder="Search friends..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Friends Grid */}
      {filteredFriends.length === 0 ? (
        <div className="py-12 text-center">
          <Users2 className="mx-auto mb-4 size-16 text-muted-foreground" />
          <p className="text-xl">
            {friends.length === 0
              ? "No friends yet"
              : "No friends match your search"}
          </p>
          <p className="text-sm text-muted-foreground">
            {friends.length === 0
              ? "Start connecting with accountability partners to stay motivated!"
              : "Try a different search term"}
          </p>
          {friends.length === 0 && (
            <Button asChild className="mt-4">
              <Link href="/friends/discover">
                <SearchIcon />
                Find Friends
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div
          className={`
            grid grid-cols-1 gap-6
            md:grid-cols-2
            lg:grid-cols-3
          `}
        >
          {filteredFriends.map((friend, index) => (
            <motion.div
              key={friend._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Image
                      src={friend.profileImage || "/default-avatar.svg"}
                      alt={friend.username}
                      className={`
                        size-12 rounded-full border-2 border-background
                        object-cover
                      `}
                      width={48}
                      height={48}
                    />
                    <div className="flex-1">
                      <CardTitle>{friend.name}</CardTitle>
                      <CardDescription>@{friend.username}</CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardFooter
                  className={`
                    gap-2
                    *:flex-1
                  `}
                >
                  <Button variant="secondary" asChild>
                    <Link href={`/member/${friend.username}`}>
                      View Profile
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href={`/messages?friendId=${friend._id}`}>
                      <MessageSquare />
                      Chat
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div
        className={`
          mt-10 grid grid-cols-1 gap-6 border-t pt-6
          md:grid-cols-3
        `}
      >
        <Link href="/friends/discover" className="group">
          <Card
            className={`
              text-center transition-colors
              group-hover:bg-muted
            `}
          >
            <CardContent>
              <SearchIcon className="mx-auto mb-4 size-8 text-primary" />
              <CardTitle>Find Friends</CardTitle>
              <CardDescription className="text-pretty">
                Discover new accountability partners
              </CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link href="/community/groups" className="group">
          <Card
            className={`
              text-center transition-colors
              group-hover:bg-muted
            `}
          >
            <CardContent>
              <Users2 className="mx-auto mb-4 size-8 text-chart-2" />
              <CardTitle>Join Groups</CardTitle>
              <CardDescription className="text-pretty">
                Connect with like-minded people
              </CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link href="/messages" className="group">
          <Card
            className={`
              text-center transition-colors
              group-hover:bg-muted
            `}
          >
            <CardContent>
              <MessageSquare className="mx-auto mb-4 size-8 text-chart-4" />
              <CardTitle>Messages</CardTitle>
              <CardDescription className="text-pretty">
                Chat with your network
              </CardDescription>
            </CardContent>
          </Card>
        </Link>
      </div>
    </main>
  )
}
