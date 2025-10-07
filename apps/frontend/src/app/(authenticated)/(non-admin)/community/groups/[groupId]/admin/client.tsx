"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import {
  ArrowLeft,
  BellDot,
  CalendarPlus,
  CrownIcon,
  GlobeIcon,
  HexagonIcon,
  Loader,
  LockIcon,
  LogOut,
  MailPlusIcon,
  PencilIcon,
  SearchIcon,
  Users2,
  XCircle,
} from "lucide-react"
import { motion } from "motion/react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import {
  fetchGroupDetails,
  fetchGroupInvitations,
  fetchGroupMembers,
  removeMember,
} from "@/api/groups/group-api"
import { AvatarCoverChangeDialog } from "@/components/group/avatar-cover-change-dialog"
import { GroupDetailsChangeDialog } from "@/components/group/group-details-change-dialog"
import { PendingGroupInvitationsDialog } from "@/components/group/pending-group-invitations-dialog"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface GroupAdminClientProps {
  groupId: string
}

export function GroupAdminClient({ groupId }: GroupAdminClientProps) {
  const { status } = useSession()

  const [membersBeingRemoved, setMembersBeingRemoved] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")

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
    data: groupInvitations,
    isLoading: isLoadingGroupInvitations,
    error: groupInvitationsError,
  } = useQuery({
    queryKey: ["groupInvitations", groupId],
    queryFn: async () => fetchGroupInvitations(groupId),
    enabled: status === "authenticated" && !!groupId,
  })

  const filteredMembers = useMemo(
    () =>
      members?.filter(
        (member) =>
          member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          member.username.toLowerCase().includes(searchQuery.toLowerCase()),
      ) || [],
    [members, searchQuery],
  )

  const queryClient = useQueryClient()
  const { mutate: removeMemberMutation } = useMutation({
    mutationFn: async (userId: string) => removeMember(groupId, userId),
    onMutate: (userId) => {
      setMembersBeingRemoved((prev) => [...prev, userId])
    },
    onSettled: (_data, _error, userId) => {
      setMembersBeingRemoved((prev) => prev.filter((id) => id !== userId))
    },
    onSuccess: () => {
      toast.success("Member removed successfully")
      queryClient.invalidateQueries({ queryKey: ["group", groupId] })
      queryClient.invalidateQueries({ queryKey: ["groupMembers", groupId] })
    },
    onError: (error) => {
      toast.error(`Error removing member`, {
        description: error.message,
      })
    },
  })

  const isLoading =
    status === "loading" ||
    isLoadingGroup ||
    isLoadingMembers ||
    isLoadingGroupInvitations

  const error =
    groupError?.message ||
    membersError?.message ||
    groupInvitationsError?.message

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
    <TooltipProvider>
      <div className="flex flex-1 flex-col gap-6">
        <Button variant="link" size="sm" asChild className="self-start !px-0">
          <Link href={`/community/groups/${groupId}`}>
            <ArrowLeft /> Back to Group Chat
          </Link>
        </Button>

        {/* Header */}
        <div
          className={`
            mb-4 flex flex-col gap-4
            sm:flex-row sm:items-center sm:justify-between
          `}
        >
          <div className="flex items-center gap-6">
            <div className="relative shrink-0">
              {group.avatar ? (
                <Image
                  src={group.avatar}
                  alt={group.name}
                  width={80}
                  height={80}
                  className={`
                    size-20 overflow-hidden rounded-full border border-muted
                    object-contain
                  `}
                />
              ) : (
                <HexagonIcon className="size-20 text-primary" />
              )}
              <Tooltip>
                <AvatarCoverChangeDialog groupId={group._id}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className={`
                        absolute right-0 bottom-0 translate-x-1/4
                        translate-y-1/4 rounded-full border border-primary
                      `}
                    >
                      <PencilIcon />
                    </Button>
                  </TooltipTrigger>
                </AvatarCoverChangeDialog>

                <TooltipContent side="bottom">Edit Group Avatar</TooltipContent>
              </Tooltip>
            </div>
            <div>
              <h1
                className={`
                  text-xl font-bold
                  md:text-3xl
                `}
              >
                Manage "{group.name}"
              </h1>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">
                  {group.description || "No description provided."}
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {group.createdAt && (
                  <Badge variant="secondary">
                    <CalendarPlus />
                    Created {format(group.createdAt, "PPp")}
                  </Badge>
                )}
                <Badge variant="secondary">
                  <Users2 />
                  <span className="font-mono">{members?.length || 0}</span>{" "}
                  {members && members.length === 1 ? "Member" : "Members"}
                </Badge>
                <Badge variant="secondary">
                  {group.isPublic ? <GlobeIcon /> : <LockIcon />}{" "}
                  {group.isPublic ? "Public" : "Private"}
                </Badge>
              </div>
            </div>
          </div>
          <div
            className={`
              flex gap-2
              *:flex-1
            `}
          >
            {groupInvitations && groupInvitations?.length > 0 && (
              <Tooltip>
                <PendingGroupInvitationsDialog groupId={group._id}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-chart-3 text-chart-3"
                    >
                      <BellDot />
                    </Button>
                  </TooltipTrigger>
                </PendingGroupInvitationsDialog>

                <TooltipContent
                  className="bg-chart-3"
                  arrowClassName="bg-chart-3 fill-chart-3"
                >
                  {groupInvitations.length} Pending Invitation
                  {groupInvitations.length === 1 ? "" : "s"}
                </TooltipContent>
              </Tooltip>
            )}
            <GroupDetailsChangeDialog currentGroupDetails={group}>
              <Button variant="outline">
                <PencilIcon /> Edit Group Details
              </Button>
            </GroupDetailsChangeDialog>
            <Button>
              <MailPlusIcon /> Invite Members
            </Button>
          </div>
        </div>

        {/* Members List Section */}

        <h2
          className={`
            text-lg font-bold
            md:text-xl
          `}
        >
          Members
        </h2>
        {/* Search */}
        {members && members.length > 10 && (
          <div className="relative w-full max-w-md">
            <SearchIcon
              className={`
                absolute top-1/2 left-3 size-4 -translate-y-1/2
                text-muted-foreground
              `}
            />
            <Input
              type="search"
              placeholder="Search members..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}

        {/* Members Grid */}
        {filteredMembers.length === 0 ? (
          <div className="py-12 text-center">
            <Users2 className="mx-auto mb-4 size-16 text-muted-foreground" />
            <p className="text-xl">
              {members?.length === 0
                ? "No members yet"
                : "No members match your search"}
            </p>
            <p className="text-sm text-muted-foreground">
              {members?.length === 0
                ? "Invite members to join your group"
                : "Try a different search term"}
            </p>
            {members?.length === 0 && (
              <Button asChild className="mt-4">
                <Link href="/friends/discover">
                  <SearchIcon />
                  Find Members
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
            {filteredMembers.map((member, index) => {
              const isAdmin = group.createdBy._id === member._id
              return (
                <motion.div
                  key={member._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <Image
                          src={member.profileImage || "/default-avatar.svg"}
                          alt={member.username}
                          className={`
                            size-12 rounded-full border-2 border-background
                            object-cover
                          `}
                          width={48}
                          height={48}
                        />
                        <div className="flex-1">
                          <CardTitle>{member.name}</CardTitle>
                          <CardDescription>@{member.username}</CardDescription>
                        </div>
                      </div>
                      <CardAction>
                        {isAdmin && (
                          <Badge className="mt-2">
                            <CrownIcon />
                            Admin
                          </Badge>
                        )}
                      </CardAction>
                    </CardHeader>
                    <CardFooter className="gap-2">
                      <Button variant="secondary" asChild className="flex-1">
                        <Link href={`/member/${member.username}`}>
                          View Profile
                        </Link>
                      </Button>
                      {!isAdmin && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="destructive"
                              size="icon"
                              disabled={membersBeingRemoved.includes(
                                member._id,
                              )}
                              onClick={() => removeMemberMutation(member._id)}
                            >
                              {membersBeingRemoved.includes(member._id) ? (
                                <Loader className="animate-spin" />
                              ) : (
                                <LogOut />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            className={`
                              bg-destructive text-destructive-foreground
                            `}
                            arrowClassName="bg-destructive fill-destructive"
                          >
                            Remove @{member.username} from group
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </CardFooter>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
