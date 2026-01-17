"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { 
  ArrowLeft, 
  Plus, 
  Users, 
  Target, 
  Trophy,
  MoreHorizontal,
  Trash2,
  LogOut,
  UserPlus,
  Mail
} from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

import type { CollaborationGoal } from "@/api/collaboration-goals/collaboration-goal-api"

import {
  fetchCollaborationGoals,
  fetchPendingInvitations,
  deleteCollaborationGoal,
  leaveCollaborationGoal,
  acceptGoalInvitation,
  declineGoalInvitation,
} from "@/api/collaboration-goals/collaboration-goal-api"
import { LoadingSpinner } from "@/components/loading-spinner"
import { UserAvatar } from "@/components/profile/user-avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Progress } from "@/components/ui/progress"

import { CreateGroupGoalDialog } from "@/components/group-goals/create-group-goal-dialog"
import { InviteFriendsDialog } from "@/components/group-goals/invite-friends-dialog"

export default function GroupGoalsClient() {
  const { data: session } = useSession()
  const userId = session?.user?.id
  const queryClient = useQueryClient()

  const { data: goals, isLoading: goalsLoading } = useQuery({
    queryKey: ["collaboration-goals"],
    queryFn: fetchCollaborationGoals,
  })

  const { data: invitations, isLoading: invitationsLoading } = useQuery({
    queryKey: ["goal-invitations"],
    queryFn: fetchPendingInvitations,
  })

  const { mutate: deleteGoal } = useMutation({
    mutationFn: deleteCollaborationGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collaboration-goals"] })
      toast.success("Group goal deleted")
    },
    onError: (error: Error) => {
      toast.error("Failed to delete goal", { description: error.message })
    },
  })

  const { mutate: leaveGoal } = useMutation({
    mutationFn: leaveCollaborationGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collaboration-goals"] })
      toast.success("You left the group goal")
    },
    onError: (error: Error) => {
      toast.error("Failed to leave goal", { description: error.message })
    },
  })

  const { mutate: acceptInvite } = useMutation({
    mutationFn: acceptGoalInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collaboration-goals"] })
      queryClient.invalidateQueries({ queryKey: ["goal-invitations"] })
      toast.success("Invitation accepted! You joined the group goal.")
    },
    onError: (error: Error) => {
      toast.error("Failed to accept invitation", { description: error.message })
    },
  })

  const { mutate: declineInvite } = useMutation({
    mutationFn: declineGoalInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goal-invitations"] })
      toast.success("Invitation declined")
    },
    onError: (error: Error) => {
      toast.error("Failed to decline invitation", { description: error.message })
    },
  })

  const isLoading = goalsLoading || invitationsLoading

  if (isLoading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <LoadingSpinner />
      </div>
    )
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
        <h1 className="flex items-center gap-2 text-3xl font-bold">
          <Users size={36} className="text-primary" /> Group Goals
        </h1>
        <CreateGroupGoalDialog>
          <Button>
            <Plus /> New Group Goal
          </Button>
        </CreateGroupGoalDialog>
      </div>

      {/* Pending Invitations */}
      {invitations && Array.isArray(invitations) && invitations.filter(inv => inv?.goal?.title).length > 0 && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="h-5 w-5 text-primary" />
              Pending Invitations ({invitations.filter(inv => inv?.goal?.title).length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {invitations.filter(inv => inv?.goal?.title).map((invitation) => (
              <div
                key={invitation._id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-3">
                  <UserAvatar
                    userId={invitation.sender?._id}
                    src={invitation.sender?.profileImage}
                    alt={invitation.sender?.username || "User"}
                  />
                  <div>
                    <p className="font-medium">{invitation.goal.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Invited by {invitation.sender?.name || invitation.sender?.username || "Unknown"}
                    </p>
                    {invitation.message && (
                      <p className="mt-1 text-sm italic text-muted-foreground">
                        "{invitation.message}"
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => declineInvite(invitation._id)}
                  >
                    Decline
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => acceptInvite(invitation._id)}
                  >
                    Accept
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Goals List */}
      {!goals || goals.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia>
              <Users size={48} className="text-primary" />
            </EmptyMedia>
            <EmptyTitle>No Group Goals Yet</EmptyTitle>
            <EmptyDescription>
              Create a group goal and invite your friends to work on it together!
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <CreateGroupGoalDialog>
              <Button>
                <Plus /> Create Your First Group Goal
              </Button>
            </CreateGroupGoalDialog>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <GoalCard
              key={goal._id}
              goal={goal}
              userId={userId}
              onDelete={() => deleteGoal(goal._id)}
              onLeave={() => leaveGoal(goal._id)}
            />
          ))}
        </div>
      )}
    </main>
  )
}

interface GoalCardProps {
  goal: CollaborationGoal
  userId?: string
  onDelete: () => void
  onLeave: () => void
}

function GoalCard({ goal, userId, onDelete, onLeave }: GoalCardProps) {
  const isCreator = goal.createdBy._id === userId
  const progressPercent = Math.round((goal.progress / goal.target) * 100)

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Link href={`/group-goals/${goal._id}`}>
              <CardTitle className="line-clamp-1 hover:underline">
                {goal.title}
              </CardTitle>
            </Link>
            <CardDescription className="line-clamp-2 mt-1">
              {goal.description || "No description"}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isCreator ? (
                <>
                  <InviteFriendsDialog goalId={goal._id} goalTitle={goal.title}>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Invite Friends
                    </DropdownMenuItem>
                  </InviteFriendsDialog>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={onDelete}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Goal
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem onClick={onLeave}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Leave Goal
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              Progress
            </span>
            <span className="font-medium">
              {goal.progress} / {goal.target}
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <Badge
            variant={
              goal.status === "completed"
                ? "default"
                : goal.status === "in-progress"
                ? "secondary"
                : "outline"
            }
          >
            {goal.status === "completed" && <Trophy className="mr-1 h-3 w-3" />}
            {goal.status.replace("-", " ")}
          </Badge>
          {isCreator && (
            <Badge variant="outline" className="text-xs">
              Creator
            </Badge>
          )}
        </div>

        {/* Participants */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {goal.participants.length} participant{goal.participants.length !== 1 ? "s" : ""}
          </p>
          <div className="flex -space-x-2">
            {goal.participants.slice(0, 5).map((participant) => (
              <UserAvatar
                key={participant._id}
                userId={participant._id}
                src={participant.profileImage}
                alt={participant.username}
                className="h-8 w-8 border-2 border-background"
              />
            ))}
            {goal.participants.length > 5 && (
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium">
                +{goal.participants.length - 5}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
