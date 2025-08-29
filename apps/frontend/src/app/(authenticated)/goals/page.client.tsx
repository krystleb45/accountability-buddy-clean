"use client"

import { useQuery } from "@tanstack/react-query"
import {
  format,
  formatDistanceToNow,
  intervalToDuration,
  isAfter,
} from "date-fns"
import {
  Archive,
  ArrowLeft,
  CircleCheck,
  CircleDashed,
  CircleDot,
  Clock,
  Goal,
  Plus,
  SignalHigh,
  SignalLow,
  SignalMedium,
  Tag,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useMemo } from "react"
import { toast } from "sonner"

import { fetchUserGoals } from "@/api/goal/goal-api"
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
import { Progress } from "@/components/ui/progress"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useAuth } from "@/context/auth/auth-context"
import useSubscription from "@/hooks/useSubscription"
import { cn } from "@/lib/utils"
import { capitalizeFirstLetter } from "@/utils"

export default function GoalsClient() {
  const { loading: userLoading } = useAuth()

  const {
    isLoading: isSubscriptionLoading,
    hasUnlimitedGoals,
    canCreateGoal,
    maxGoals,
    currentGoalCount,
  } = useSubscription()

  const {
    data: goals,
    isPending: isLoading,
    error,
  } = useQuery({
    queryKey: ["goals"],
    queryFn: fetchUserGoals,
  })

  useEffect(() => {
    if (error) {
      toast.error("There was an error loading your goals.", {
        description: error.message,
      })
    }
  }, [error])

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

  if (isLoading || userLoading || isSubscriptionLoading) {
    return <LoadingSpinner overlay />
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <Button variant="link" size="sm" asChild>
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
            const isOverdue =
              isAfter(new Date(), g.dueDate) &&
              (!g.progress || g.progress < 100)
            const dueSoon =
              !isOverdue &&
              (intervalToDuration({ start: new Date(), end: g.dueDate })
                ?.days ?? 0) <= 3

            return (
              <Card
                key={g._id}
                className={cn("relative pb-0", {
                  "border-destructive": isOverdue,
                  "border-chart-3": dueSoon,
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
                    {g.status === "archived" ? (
                      <Archive className="text-muted-foreground" />
                    ) : g.status === "not-started" ? (
                      <CircleDashed />
                    ) : g.status === "in-progress" ? (
                      <CircleDot className="text-chart-3" />
                    ) : (
                      <CircleCheck className="text-primary" />
                    )}
                    <div className="space-y-1">
                      <CardTitle>{g.title}</CardTitle>
                      <CardDescription>{g.description}</CardDescription>
                    </div>
                  </div>
                  {g.visibility === "public" && (
                    <CardAction>
                      <Badge>Public</Badge>
                    </CardAction>
                  )}
                </CardHeader>
                <CardContent className="mt-auto">
                  <div className="flex flex-wrap justify-between gap-6">
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
                        {formatDistanceToNow(g.dueDate, { addSuffix: true })}
                      </p>
                    </div>
                    {g.priority && (
                      <div>
                        <p
                          className={`
                            text-2xs font-semibold tracking-widest
                            text-muted-foreground uppercase
                          `}
                        >
                          Priority
                        </p>
                        <p
                          className={cn(
                            `
                              mt-1 flex items-center justify-end gap-1 text-sm
                              font-semibold
                            `,
                            {
                              "text-destructive": g.priority === "high",
                              "text-chart-3": g.priority === "medium",
                              "text-muted-foreground": g.priority === "low",
                            },
                          )}
                        >
                          <SignalHigh
                            size={16}
                            className={cn({
                              hidden: g.priority !== "high",
                            })}
                          />
                          <SignalMedium
                            size={16}
                            className={cn({
                              hidden: g.priority !== "medium",
                            })}
                          />
                          <SignalLow
                            size={16}
                            className={cn({
                              hidden: g.priority !== "low",
                            })}
                          />
                          {capitalizeFirstLetter(g.priority)}
                        </p>
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
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Progress value={g.progress || 0} max={100} />
                        </TooltipTrigger>
                        <TooltipContent>{g.progress}%</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
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
            )
          })}
        </div>
      )}
    </main>
  )
}
