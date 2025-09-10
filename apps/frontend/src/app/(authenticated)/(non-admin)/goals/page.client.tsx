"use client"

import { useQuery } from "@tanstack/react-query"
import {
  differenceInCalendarDays,
  format,
  formatDistanceToNow,
  isAfter,
} from "date-fns"
import { ArrowLeft, Clock, Goal, Plus, Tag, XCircle } from "lucide-react"
import Link from "next/link"
import { useMemo } from "react"

import { fetchUserGoals } from "@/api/goal/goal-api"
import { GoalPriority } from "@/components/goals/goal-priority"
import { GoalProgress } from "@/components/goals/goal-progress"
import { GoalStatus } from "@/components/goals/goal-status"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useSubscription } from "@/hooks/useSubscription"
import { cn } from "@/lib/utils"

export default function GoalsClient() {
  const {
    isLoading: isSubscriptionLoading,
    hasUnlimitedGoals,
    canCreateGoal,
    maxGoals,
    currentGoalCount,
    isSubscriptionActive,
  } = useSubscription()

  const {
    data: goals,
    isPending: isLoading,
    error,
  } = useQuery({
    queryKey: ["goals"],
    queryFn: fetchUserGoals,
    enabled: isSubscriptionActive,
  })

  // Calculate active goals count from current goals
  const activeGoalsCount = useMemo(
    () => goals?.filter((goal) => goal.isActive).length || 0,
    [goals],
  )

  // Get upgrade message based on subscription tier
  const upgradeMessage = useMemo(() => {
    if (hasUnlimitedGoals) {
      return null
    }

    if (!canCreateGoal) {
      return "Upgrade to create more goals"
    }

    const remaining = maxGoals - currentGoalCount
    return `${remaining} of ${maxGoals} goals remaining`
  }, [hasUnlimitedGoals, canCreateGoal, maxGoals, currentGoalCount])

  if ((isLoading && isSubscriptionActive) || isSubscriptionLoading) {
    return (
      <main className="grid min-h-screen place-items-center">
        <LoadingSpinner />
      </main>
    )
  }

  if (error) {
    return (
      <main className="grid min-h-screen place-items-center">
        <div className="text-center">
          <XCircle size={60} className="mx-auto mb-6 text-destructive" />
          <p className="mb-2">There was an error loading your goals.</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Button variant="link" size="sm" asChild className="!px-0">
          <Link href="/dashboard">
            <ArrowLeft /> Back to Dashboard
          </Link>
        </Button>

        <div className="flex flex-col items-end gap-2">
          {upgradeMessage && (
            <div className="text-xs text-muted-foreground">
              {upgradeMessage}
            </div>
          )}

          <TooltipProvider>
            {canCreateGoal ? (
              <Button asChild>
                <Link href="/goals/create">
                  <Plus /> Add Goal
                </Link>
              </Button>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button asChild disabled={!canCreateGoal}>
                    <Link href="/goals/create">
                      <Plus /> Add Goal
                    </Link>
                  </Button>
                </TooltipTrigger>

                <TooltipContent>
                  Goal limit reached ({activeGoalsCount}/{maxGoals})
                </TooltipContent>
              </Tooltip>
            )}
          </TooltipProvider>
        </div>
      </div>

      <h2 className="flex items-center gap-2 text-3xl font-bold">
        <Goal size={36} className="text-primary" /> Your Goals
      </h2>

      {goals?.length === 0 ? (
        <div className="grid flex-1 place-items-center text-center">
          <div>
            <div className="mb-4">
              <Goal size={80} className="mx-auto text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">No goals yet</h3>
            <p className="mb-6 text-muted-foreground">
              Create your first goal to get started!
            </p>
            {canCreateGoal && (
              <Button asChild>
                <Link href="/goals/create">
                  <Plus /> Create your first goal
                </Link>
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div
          className={`
            grid grid-cols-1 gap-6
            sm:grid-cols-2
            lg:grid-cols-3
          `}
        >
          {goals?.map((g) => {
            const isOverdue = isAfter(new Date(), g.dueDate) && g.isActive
            const dueSoon =
              !isOverdue &&
              g.isActive &&
              differenceInCalendarDays(g.dueDate, new Date()) <= 3
            const isCompleted = g.status === "completed"

            return (
              <Link key={g._id} href={`/goals/${g._id}`} className="block">
                <Card
                  className={cn("relative h-full pb-0", {
                    "border-destructive": isOverdue,
                    "border-chart-3": dueSoon,
                    "border-primary": isCompleted,
                  })}
                >
                  {(isOverdue || dueSoon) && (
                    <Badge
                      variant={isOverdue ? "destructive" : "warning"}
                      className="absolute top-0 right-4 -translate-y-1/2"
                    >
                      {isOverdue ? "Overdue" : "Due Soon"}
                    </Badge>
                  )}
                  <CardHeader>
                    <div className="mb-2 flex items-center gap-3">
                      <GoalStatus status={g.status} />
                      <div className="space-y-1">
                        <CardTitle>{g.title}</CardTitle>
                        <CardDescription>{g.description}</CardDescription>
                      </div>
                    </div>
                    <CardAction className="flex gap-2">
                      <Badge
                        variant="secondary"
                        className="font-bold text-primary"
                      >
                        {g.points} XP
                      </Badge>
                      {g.visibility === "public" && <Badge>Public</Badge>}
                    </CardAction>
                  </CardHeader>
                  <CardContent className="mt-auto">
                    <div className="flex flex-wrap justify-between gap-6">
                      {g.isActive ? (
                        <div>
                          <p
                            className={`
                              flex items-center gap-2 text-2xs font-semibold
                              tracking-widest text-muted-foreground uppercase
                              [&_svg]:size-4
                            `}
                          >
                            <Clock /> Due Date
                          </p>
                          <p className="mt-1 font-semibold">
                            {format(g.dueDate, "PP")}
                          </p>
                          <p
                            className={cn("mt-1 text-sm", {
                              "text-destructive": isOverdue,
                              "text-chart-3": dueSoon,
                            })}
                          >
                            {formatDistanceToNow(g.dueDate, {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      ) : g.completedAt ? (
                        <div>
                          <p
                            className={`
                              flex items-center gap-2 text-2xs font-semibold
                              tracking-widest text-muted-foreground uppercase
                              [&_svg]:size-4
                            `}
                          >
                            <Clock /> Completed on
                          </p>
                          <p className="mt-1 font-semibold">
                            {format(g.completedAt, "PP")}
                          </p>
                          <p className="mt-1 text-sm">
                            {formatDistanceToNow(g.completedAt, {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      ) : null}
                      {g.priority && (
                        <div className="text-right">
                          <p
                            className={`
                              text-2xs font-semibold tracking-widest
                              text-muted-foreground uppercase
                            `}
                          >
                            Priority
                          </p>
                          <GoalPriority
                            priority={g.priority}
                            className="mt-2"
                          />
                        </div>
                      )}
                    </div>
                    <div className="mt-6">
                      <p
                        className={`
                          mb-2 text-2xs font-semibold tracking-widest
                          text-muted-foreground uppercase
                        `}
                      >
                        Progress
                      </p>
                      <GoalProgress progress={g.progress} className="mt-2" />
                    </div>
                  </CardContent>
                  <CardFooter
                    className={`
                      items-end justify-between gap-6 rounded-b-xl border-t
                      bg-muted !py-4
                    `}
                  >
                    <div>
                      <p
                        className={`
                          text-2xs font-semibold tracking-widest
                          text-muted-foreground uppercase
                        `}
                      >
                        Category
                      </p>
                      <p className="mt-1 text-sm font-semibold">{g.category}</p>
                    </div>
                    {g.tags.length > 0 ? (
                      <div
                        className={`
                          flex flex-wrap-reverse items-center justify-end gap-2
                        `}
                      >
                        <Tag
                          size={16}
                          className="rotate-y-180 text-muted-foreground"
                        />
                        {g.tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                  </CardFooter>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </main>
  )
}
