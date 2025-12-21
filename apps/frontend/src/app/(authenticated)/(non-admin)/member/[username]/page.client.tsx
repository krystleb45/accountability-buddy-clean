"use client"

import { useMutation, useQuery } from "@tanstack/react-query"
import {
  AwardIcon,
  CameraOff,
  Clock,
  Goal,
  Loader,
  MapPin,
  MessageSquare,
  UserPlus2,
  XCircle,
} from "lucide-react"
import { motion } from "framer-motion"
import { useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { useMemo } from "react"
import { toast } from "sonner"

import { fetchBadgesByUsername } from "@/api/badge/badge-api"
import { sendFriendRequest } from "@/api/friends/friend-api"
import { getMemberGoals } from "@/api/goal/goal-api"
import { getMemberByUsername } from "@/api/users/user-api"
import { BadgeCard } from "@/components/badge/badge-card"
import { GoalCard } from "@/components/goals/goal-card"
import { LoadingSpinner } from "@/components/loading-spinner"
import { UserAvatar } from "@/components/profile/user-avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useAuth } from "@/context/auth/auth-context"
import { useGetCurrentTimeWithTimezone } from "@/hooks/use-get-current-time-with-timezone"
import { cn } from "@/lib/utils"

interface MemberPageClientProps {
  username: string
}

const MotionCard = motion.create(Card)

export function MemberPageClient({ username }: MemberPageClientProps) {
  const { status } = useSession()
  const { user } = useAuth()

  const {
    data: member,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["member", username],
    queryFn: async () => {
      return getMemberByUsername(username)
    },
    enabled: status === "authenticated" && !!username, // Only run the query if username is provided
  })

  const { mutate: sendRequest, isPending: isSendingRequest } = useMutation({
    mutationFn: (recipientId: string) => sendFriendRequest(recipientId),
    onSuccess: async () => {
      toast.success("Friend request sent!")
    },
    onError: (error) => {
      toast.error("Error sending friend request", {
        description: error.message,
      })
    },
  })

  const currentTime = useGetCurrentTimeWithTimezone(member?.timezone || "UTC")

  const isFriend = useMemo(() => {
    if (!user || !member) {
      return false
    }
    return member.friends.some((friend) => friend._id === user._id)
  }, [user, member])

  const {
    data: goals,
    isLoading: isLoadingGoals,
    error: goalsError,
  } = useQuery({
    queryKey: ["member-goals", username],
    queryFn: async () => {
      return getMemberGoals(username)
    },
    enabled: !!member && member.privacy === "public",
  })

  const {
    data: badges,
    isLoading: isLoadingBadges,
    error: badgesError,
  } = useQuery({
    queryKey: ["member-badges", username],
    queryFn: async () => {
      return fetchBadgesByUsername(username)
    },
    enabled: !!member && member.privacy === "public",
  })

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
          <p className="mb-2">There was an error loading the member profile.</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    )
  }

  if (!member) {
    return null
  }

  return (
    <motion.div
      className="flex flex-col gap-6 pb-8"
      transition={{ staggerChildren: 0.1 }}
    >
      <MotionCard
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={cn("w-full overflow-hidden", {
          "pt-0": member.privacy === "public",
        })}
      >
        {/* Cover */}
        {member.privacy === "public" && (
          <div className="relative aspect-[5/1] min-h-52 w-full">
            {member.coverImage ? (
              <Image
                src={member.coverImage}
                alt="Cover"
                fill
                sizes="(min-width: 1280px) 1280px, 100vw"
                className="size-full object-cover"
                priority
                key={member.coverImage}
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-muted">
                <div
                  className={`
                    flex flex-col items-center gap-2 text-muted-foreground
                  `}
                >
                  <CameraOff className="size-8" />
                  <p>No Cover Image</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Avatar */}
        <CardHeader>
          <div className="flex items-center gap-4">
            <UserAvatar
              userId={member._id}
              src={member.profileImage}
              alt={member.username}
              status={member.activeStatus}
              size="lg"
            />
            <div>
              <CardTitle>{member.name}</CardTitle>
              <CardDescription>@{member.username}</CardDescription>
            </div>
          </div>

          <CardAction>
            {isFriend ? (
              <Button asChild variant="outline">
                <Link href={`/messages?friend=${member.username}`}>
                  <MessageSquare />
                  Chat
                </Link>
              </Button>
            ) : (
              <Button
                disabled={isSendingRequest}
                onClick={() => sendRequest(member._id)}
              >
                <UserPlus2 />{" "}
                {isSendingRequest ? (
                  <>
                    Sending... <Loader className="animate-spin" />
                  </>
                ) : (
                  "Add Friend"
                )}
              </Button>
            )}
          </CardAction>
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
          {member.privacy === "private" ? (
            <div className="text-center text-muted-foreground">
              This profile is private.
            </div>
          ) : member.privacy === "friends" ? (
            <div className="text-center text-muted-foreground">
              This profile is only visible to friends.
            </div>
          ) : (
            <>
              {/* Bio */}
              <section>
                <h2 className="mb-2 text-sm font-bold">Bio</h2>
                {member.bio ? (
                  <p>{member.bio}</p>
                ) : (
                  <p className="text-muted-foreground">No bio yet.</p>
                )}
              </section>

              {/* Interests */}
              <section>
                <h2 className="mb-2 text-sm font-bold">Interests</h2>
                {member.interests && member.interests.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {member.interests.map((interest) => (
                      <Badge
                        key={interest}
                        variant="outline"
                        className={`
                          text-sm
                          has-[button[disabled]]:opacity-50
                        `}
                      >
                        {interest}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No interests yet.</p>
                )}
              </section>

              <div
                className={`
                  grid grid-cols-1 gap-6
                  md:grid-cols-2
                `}
              >
                {/* Location */}
                <section>
                  <h2 className="mb-2 text-sm font-bold">Location</h2>
                  {member.location ? (
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <MapPin className="size-5" />{" "}
                        <p>
                          {member.location.city}, {member.location.state},{" "}
                          {member.location.country}
                        </p>
                      </div>
                      {member.location.coordinates && (
                        <div
                          className={`
                            mb-2 flex items-center gap-2 text-sm
                            text-muted-foreground
                          `}
                        >
                          <Clock className="h-4 w-5" />{" "}
                          <p className="font-mono">{currentTime}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No location set.</p>
                  )}
                </section>

                {/* Friends */}
                <section>
                  <h2 className="mb-2 text-sm font-bold">Friends</h2>
                  {member.friends.length > 0 ? (
                    <div className="flex -space-x-2">
                      {member.friends.map((friend) => (
                        <TooltipProvider key={friend._id}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link
                                href={`/member/${friend.username}`}
                                aria-label={friend.username}
                              >
                                <Image
                                  height={32}
                                  width={32}
                                  src={
                                    friend.profileImage || "/default-avatar.svg"
                                  }
                                  alt={friend.username || "Avatar"}
                                  className={`
                                    size-8 shrink-0 rounded-full border-2
                                    border-background object-cover
                                  `}
                                  key={friend.profileImage}
                                />
                              </Link>
                            </TooltipTrigger>

                            <TooltipContent className="text-center">
                              <p className="font-bold">{friend.name}</p>
                              <p>@{friend.username}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No friends yet.</p>
                  )}
                </section>
              </div>
            </>
          )}
        </CardContent>
      </MotionCard>
      <MotionCard
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Goal className="text-primary" /> Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingGoals ? (
            <div className="grid min-h-32 place-items-center">
              <LoadingSpinner />
            </div>
          ) : goalsError ? (
            <div className="grid min-h-32 place-items-center">
              <div className="text-center">
                <XCircle size={40} className="mx-auto mb-4 text-destructive" />
                <p className="text-sm text-muted-foreground">
                  {(goalsError as Error).message}
                </p>
              </div>
            </div>
          ) : goals && goals.length > 0 ? (
            <div
              className={`
                grid grid-cols-1 gap-6
                sm:grid-cols-2
                lg:grid-cols-3
              `}
            >
              {goals.map((goal) => (
                <GoalCard key={goal._id} goal={goal} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              This member has not set any public goals yet.
            </p>
          )}
        </CardContent>
      </MotionCard>

      <MotionCard
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AwardIcon className="text-primary" /> Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingBadges ? (
            <div className="grid min-h-32 place-items-center">
              <LoadingSpinner />
            </div>
          ) : badgesError ? (
            <div className="grid min-h-32 place-items-center">
              <div className="text-center">
                <XCircle size={40} className="mx-auto mb-4 text-destructive" />
                <p className="text-sm text-muted-foreground">
                  {(badgesError as Error).message}
                </p>
              </div>
            </div>
          ) : badges && badges.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-4">
              {badges.map((badge) => (
                <BadgeCard key={badge._id} badge={badge} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              This member has not earned any badges yet.
            </p>
          )}
        </CardContent>
      </MotionCard>
    </motion.div>
  )
}
