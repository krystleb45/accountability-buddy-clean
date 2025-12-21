import { useMutation, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import {
  CalendarClock,
  Crown,
  DoorOpenIcon,
  HexagonIcon,
  LogInIcon,
  MailPlusIcon,
  MessageSquare,
  UserCheck2Icon,
} from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import type { GroupWithCreated } from "@/api/groups/group-api"

import {
  joinGroup,
  leaveGroup,
  requestGroupInvite,
} from "@/api/groups/group-api"

import { UserAvatar } from "../profile/user-avatar"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card"

interface GroupCardProps {
  group: GroupWithCreated
  index?: number
  isJoined?: boolean
  isRequested?: boolean
  isInvited?: boolean
  isRejected?: boolean
  smallVersion?: boolean
}

const MotionCard = motion.create(Card)

export function GroupCard({
  group,
  index = 0,
  isJoined,
  isRequested,
  isInvited,
  isRejected,
  smallVersion,
}: GroupCardProps) {
  const queryClient = useQueryClient()
  const router = useRouter()

  const { mutate: joinGroupMutate, isPending: isJoining } = useMutation({
    mutationFn: async () => joinGroup(group._id),
    onSuccess: () => {
      toast.success(`Joined ${group.name} successfully`)
      queryClient.invalidateQueries({ queryKey: ["my-groups"] })
      queryClient.invalidateQueries({ queryKey: ["groups"] })
      router.push(`/community/groups/${group._id}`)
    },
    onError: (error) => {
      toast.error("Failed to join group", {
        description: error.message,
      })
    },
  })

  const { mutate: requestInviteMutate, isPending: isRequestingInvite } =
    useMutation({
      mutationFn: async () => requestGroupInvite(group._id),
      onSuccess: () => {
        toast.success(`Requested to join ${group.name} successfully`)
        queryClient.invalidateQueries({ queryKey: ["userGroupInvitations"] })
      },
      onError: (error) => {
        toast.error("Failed to request group invite", {
          description: error.message,
        })
      },
    })

  const { mutate: leaveGroupMutate, isPending: isLeaving } = useMutation({
    mutationFn: async () => leaveGroup(group._id),
    onSuccess: () => {
      toast.success(`Left ${group.name} successfully`)
      queryClient.invalidateQueries({ queryKey: ["my-groups"] })
      queryClient.invalidateQueries({ queryKey: ["groups"] })
      router.push(`/community/groups`)
    },
    onError: (error) => {
      toast.error("Failed to leave group", {
        description: error.message,
      })
    },
  })

  return (
    <MotionCard
      key={group._id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <CardHeader>
        <div className="flex items-center gap-2">
          {group.avatar ? (
            <Image
              src={group.avatar}
              alt={group.name}
              className={`
                size-12 rounded-full border-2 border-background object-cover
              `}
              width={48}
              height={48}
            />
          ) : (
            <HexagonIcon className="size-12 text-primary" />
          )}
          <div>
            <CardTitle>{group.name}</CardTitle>
            <CardDescription>
              <span className="font-mono">{group.memberCount}</span>{" "}
              {group.memberCount === 1 ? "member" : "members"}
            </CardDescription>
          </div>
        </div>
        {isJoined && (
          <CardAction>
            <Badge>
              <UserCheck2Icon />
              Joined
            </Badge>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <p className="line-clamp-3 text-ellipsis">{group.description}</p>

        {smallVersion ? null : (
          <>
            {/* Tags */}
            <div className="mb-6 flex flex-wrap gap-1">
              {group.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  #{tag}
                </Badge>
              ))}
            </div>

            {/* Activity & admin */}
            <div className="mt-auto">
              <p
                className={`
                  mb-2 flex items-center gap-1 text-2xs font-bold
                  tracking-widest text-muted-foreground uppercase
                `}
              >
                <Crown className="size-4" /> Admin
              </p>
              <Link
                href={`/member/${group.createdBy.username}`}
                className={`
                  flex w-fit cursor-pointer items-center gap-2 rounded-lg border
                  px-4 py-2 transition-colors
                  hover:bg-accent
                `}
              >
                <UserAvatar
                  userId={group.createdBy._id}
                  src={group.createdBy.profileImage}
                  alt={group.createdBy.username}
                  status={group.createdBy.activeStatus}
                  size="sm"
                />
                <div className="flex-1">
                  <p className="text-sm font-bold">{group.createdBy.name}</p>
                  <p className="text-xs text-muted-foreground">
                    @{group.createdBy.username}
                  </p>
                </div>
              </Link>
            </div>
            {group.lastActivity && (
              <div>
                <p
                  className={`
                    mb-2 flex items-center gap-1 text-2xs font-bold
                    tracking-widest text-muted-foreground uppercase
                  `}
                >
                  <CalendarClock className="size-4" /> Last Active
                </p>
                <p className="font-mono text-sm">
                  {format(group.lastActivity, "PPp")}
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>

      {/* Actions */}
      <CardFooter className="gap-2">
        {isJoined ? (
          <>
            <Button asChild className="flex-1">
              <Link href={`/community/groups/${group._id}`}>
                <MessageSquare />
                Open Chat
              </Link>
            </Button>
            <Button
              variant="secondary"
              onClick={() => leaveGroupMutate()}
              disabled={isLeaving}
              className="flex-1"
            >
              <DoorOpenIcon />
              {isLeaving ? "Leaving..." : "Leave"}
            </Button>
          </>
        ) : (
          <Button
            onClick={() =>
              group.isPublic ? joinGroupMutate() : requestInviteMutate()
            }
            disabled={
              isJoining || isRequestingInvite || isRequested || isInvited
            }
            className="w-full"
          >
            {group.isPublic ? <LogInIcon /> : <MailPlusIcon />}
            {isJoining
              ? "Joining..."
              : isRequestingInvite
                ? "Requesting..."
                : group.isPublic
                  ? "Join Group"
                  : isRequested
                    ? "Invite Requested"
                    : isInvited
                      ? "Invite Pending"
                      : isRejected
                        ? "Request Rejected. Retry?"
                        : "Request Invite"}
          </Button>
        )}
      </CardFooter>
    </MotionCard>
  )
}
