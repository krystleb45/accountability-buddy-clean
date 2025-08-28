"use client"

import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, Goal, Plus } from "lucide-react"
import Link from "next/link"
import { useEffect, useMemo } from "react"
import { toast } from "sonner"

import { fetchUserGoals } from "@/api/goal/goal-api"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useAuth } from "@/context/auth/auth-context"
import useSubscription from "@/hooks/useSubscription"

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
            xl:grid-cols-4
          `}
        >
          {goals?.map((g) => {
            // const dateValue = g.dueDate
            return (
              <div
                key={g._id}
                className={`
                  rounded-lg bg-gray-900 p-4 shadow-lg transition-transform
                  hover:scale-105
                `}
              >
                <span
                  className={`
                    mb-2 inline-block rounded bg-green-700 px-2 py-1 text-xs
                    text-white
                  `}
                >
                  {(g as any).category ?? "General"}
                </span>
                <h3 className="mb-1 text-lg font-semibold text-primary">
                  {g.title}
                </h3>
                <div
                  className={`
                    mb-3 flex items-center justify-between text-sm text-gray-400
                  `}
                >
                  {/* <span>Due: {formatDueDate(dateValue)}</span>
                <span>{daysLeft(dateValue)}</span> */}
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full">
                  <div
                    className="h-full bg-green-500 transition-all duration-800"
                    style={{ width: `${g.progress || 0}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
