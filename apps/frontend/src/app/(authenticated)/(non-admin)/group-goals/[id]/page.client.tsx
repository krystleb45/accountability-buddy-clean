"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { formatDistanceToNow } from "date-fns"
import {
  ArrowLeft,
  Minus,
  Plus,
  Target,
  Trash2,
  Trophy,
  UserPlus,
  Users,
  LogOut,
  Activity,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useState, useMemo } from "react"
import { toast } from "sonner"

import type { Contribution } from "@/api/collaboration-goals/collaboration-goal-api"

import {
  fetchCollaborationGoal,
  updateGoalProgress,
  deleteCollaborationGoal,
  leaveCollaborationGoal,
  getContributionsByUser,
} from "@/api/collaboration-goals/collaboration-goal-api"
import { LoadingSpinner } from "@/components/loading-spinner"
import { InviteFriendsDialog } from "@/components/group-goals/invite-friends-dialog"
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
import { Progress } from "@/components/ui/progress"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface GroupGoalDetailClientProps {
  goalId: string
}

export default function GroupGoalDetailClient({ goalId }: GroupGoalDetailClientProps) {
  const { data: session } = useSession()
  const userId = session?.user?.id
  const router = useRouter()
  const queryClient = useQueryClient()
  const [progressIncrement, setProgressIncrement] = useState(1)

  const { data: goal, isLoading, error } = useQuery({
    queryKey: ["collaboration-goal", goalId],
    queryFn: () => fetchCollaborationGoal(goalId),
  })

  // Calculate contributions by user
  const contributionsByUser = useMemo(() => {
    if (!goal) return new Map<string, number>()
    return getContributionsByUser(goal)
  }, [goal])

  // Get sorted contributions for activity feed (most recent first)
  const recentContributions = useMemo(() => {
    if (!goal?.contributions) return []
    return [...goal.contributions]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 20) // Show last 20 activities
  }, [goal])

  const { mutate: updateProgress, isPending: isUpdating } = useMutation({
    mutationFn: (increment: number) => updateGoalProgress(goalId, increment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collaboration-goal", goalId] })
      queryClient.invalidateQueries({ queryKey: ["collaboration-goals"] })
      toast.success("Progress updated!")
    },
    onError: (error: Error) => {
      toast.error("Failed to update progress", { description: error.message })
    },
  })

  const { mutate: deleteGoal, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteCollaborationGoal(goalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collaboration-goals"] })
      toast.success("Group goal deleted")
      router.push("/group-goals")
    },
    onError: (error: Error) => {
      toast.error("Failed to delete goal", { description: error.message })
    },
  })

  const { mutate: leaveGoal, isPending: isLeaving } = useMutation({
    mutationFn: () => leaveCollaborationGoal(goalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collaboration-goals"] })
      toast.success("You left the group goal")
      router.push("/group-goals")
    },
    onError: (error: Error) => {
      toast.error("Failed to leave goal", { description: error.message })
    },
  })

  if (isLoading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !goal) {
    return (
      <main className="flex flex-col gap-6">
        <Button variant="link" size="sm" asChild className="self-start !px-0">
          <Link href="/group-goals">
            <ArrowLeft /> Back to Group Goals
          </Link>
        </Button>
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Goal Not Found</CardTitle>
            <CardDescription>
              This group goal may have been deleted or you don&apos;t have access to it.
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    )
  }

  const isCreator = goal.createdBy._id === userId
  const progressPercent = Math.round((goal.progress / goal.target) * 100)
  const isCompleted = goal.status === "completed"

  const handleIncrement = () => {
    if (goal.progress + progressIncrement <= goal.target) {
      updateProgress(progressIncrement)
    }
  }

  return (
    <main className="flex flex-col gap-6">
      <Button variant="link" size="sm" asChild className="self-start !px-0">
        <Link href="/group-goals">
          <ArrowLeft /> Back to Group Goals
        </Link>
      </Button>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold">
            {isCompleted && <Trophy className="h-8 w-8 text-yellow-500" />}
            {goal.title}
          </h1>
          <p className="mt-2 text-muted-foreground">{goal.description || "No description"}</p>
        </div>
        <div className="flex gap-2">
          {isCreator ? (
            <>
              <InviteFriendsDialog goalId={goal._id} goalTitle={goal.title}>
                <Button variant="outline">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invite Friends
                </Button>
              </InviteFriendsDialog>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isDeleting}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Group Goal?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this group goal for all participants.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteGoal()}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          ) : (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" disabled={isLeaving}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Leave Goal
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Leave Group Goal?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You will no longer be part of this group goal. You can be re-invited later.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => leaveGoal()}>
                    Leave
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Status and Info */}
      <div className="flex flex-wrap gap-3">
        <Badge
          variant={
            goal.status === "completed"
              ? "default"
              : goal.status === "in-progress"
              ? "secondary"
              : "outline"
          }
          className="text-sm"
        >
          {goal.status === "completed" && <Trophy className="mr-1 h-3 w-3" />}
          {goal.status.replace("-", " ")}
        </Badge>
        {isCreator && (
          <Badge variant="outline" className="text-sm">
            You created this goal
          </Badge>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Progress Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Current Progress</span>
                <span className="font-bold">
                  {goal.progress} / {goal.target} ({progressPercent}%)
                </span>
              </div>
              <Progress value={progressPercent} className="h-4" />
            </div>

            {!isCompleted && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Update increment:</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setProgressIncrement(Math.max(1, progressIncrement - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">{progressIncrement}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setProgressIncrement(progressIncrement + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Button
                  className="w-full"
                  onClick={handleIncrement}
                  disabled={isUpdating || goal.progress >= goal.target}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Progress
                </Button>
              </div>
            )}

            {isCompleted && (
              <div className="rounded-lg bg-green-500/10 p-4 text-center">
                <Trophy className="mx-auto h-8 w-8 text-yellow-500" />
                <p className="mt-2 font-medium text-green-500">Goal Completed! 🎉</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Participants & Contributions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Participants ({goal.participants.length})
            </CardTitle>
            <CardDescription>
              Individual contributions to this goal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {goal.participants.map((participant) => {
                const userContribution = contributionsByUser.get(participant._id) || 0
                const contributionPercent = goal.target > 0 
                  ? Math.round((userContribution / goal.target) * 100) 
                  : 0

                return (
                  <div
                    key={participant._id}
                    className="rounded-lg border p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          userId={participant._id}
                          src={participant.profileImage}
                          alt={participant.username}
                          className="h-10 w-10"
                        />
                        <div>
                          <p className="font-medium">
                            {participant.name || participant.username}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            @{participant.username}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {participant._id === goal.createdBy._id && (
                          <Badge variant="secondary" className="mb-1 text-xs">
                            Creator
                          </Badge>
                        )}
                        <p className="text-sm font-semibold text-primary">
                          +{userContribution} contributed
                        </p>
                      </div>
                    </div>
                    {/* Individual progress bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Contribution</span>
                        <span>{contributionPercent}% of goal</span>
                      </div>
                      <Progress value={contributionPercent} className="h-2" />
                    </div>
                  </div>
                )
              })}
            </div>

            {isCreator && (
              <InviteFriendsDialog goalId={goal._id} goalTitle={goal.title}>
                <Button variant="outline" className="mt-4 w-full">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invite More Friends
                </Button>
              </InviteFriendsDialog>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Activity Feed
          </CardTitle>
          <CardDescription>
            Recent contributions from all participants
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentContributions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <TrendingUp className="mb-3 h-10 w-10 opacity-50" />
              <p className="font-medium">No activity yet</p>
              <p className="text-sm">Be the first to add progress to this goal!</p>
            </div>
          ) : (
            <div className="h-[300px] overflow-y-auto pr-4">
              <div className="space-y-4">
                {recentContributions.map((contribution, index) => (
                  <ActivityItem key={contribution._id || index} contribution={contribution} />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}

interface ActivityItemProps {
  contribution: Contribution
}

function ActivityItem({ contribution }: ActivityItemProps) {
  const timeAgo = formatDistanceToNow(new Date(contribution.createdAt), { addSuffix: true })

  return (
    <div className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
      <UserAvatar
        userId={contribution.user._id}
        src={contribution.user.profileImage}
        alt={contribution.user.username}
        className="h-9 w-9"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium truncate">
            {contribution.user.name || contribution.user.username}
          </span>
          <span className="text-muted-foreground">added</span>
          <Badge variant="secondary" className="font-semibold">
            +{contribution.amount}
          </Badge>
          <span className="text-muted-foreground">progress</span>
        </div>
        {contribution.note && (
          <p className="mt-1 text-sm text-muted-foreground italic">
            &quot;{contribution.note}&quot;
          </p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">{timeAgo}</p>
      </div>
    </div>
  )
}
