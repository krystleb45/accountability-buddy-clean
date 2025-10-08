"use client"

import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, Goal, Plus, XCircle } from "lucide-react"
import Link from "next/link"
import { useMemo } from "react"

import { fetchUserGoals } from "@/api/goal/goal-api"
import { GoalCard } from "@/components/goals/goal-card"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useSubscription } from "@/hooks/useSubscription"

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
        </div>
      </div>

      <h1 className="flex items-center gap-2 text-3xl font-bold">
        <Goal size={36} className="text-primary" /> Your Goals
      </h1>

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
          {goals?.map((g) => (
            <Link key={g._id} href={`/goals/${g._id}`} className="block">
              <GoalCard goal={g} />
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
