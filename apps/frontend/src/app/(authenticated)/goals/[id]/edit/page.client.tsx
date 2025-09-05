"use client"

import { useQuery } from "@tanstack/react-query"
import { Goal, XCircle } from "lucide-react"

import { fetchGoalDetails } from "@/api/goal/goal-api"
import { GoalForm } from "@/components/goals/goal-form"
import { LoadingSpinner } from "@/components/loading-spinner"
import useSubscription from "@/hooks/useSubscription"

interface GoalEditClientProps {
  id: string
}

export function GoalEditClient({ id }: GoalEditClientProps) {
  const { isSubscriptionActive, isLoading } = useSubscription()

  const {
    data: goal,
    isPending,
    error,
  } = useQuery({
    queryKey: ["goals", id],
    queryFn: () => fetchGoalDetails(id),
  })

  if ((isPending && isSubscriptionActive) || isLoading) {
    return (
      <main className="grid min-h-screen place-items-center">
        <LoadingSpinner />
      </main>
    )
  }

  if (error || !goal) {
    return (
      <main className="grid min-h-screen place-items-center">
        <div className="text-center">
          <XCircle size={60} className="mx-auto mb-6 text-destructive" />
          <p className="mb-2">There was an error loading goal details.</p>
          {error && (
            <p className="text-sm text-muted-foreground">{error.message}</p>
          )}
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-8 flex items-center gap-2 text-2xl font-bold">
        <Goal className="text-primary" size={28} /> Edit Goal:{" "}
        <strong>{goal.title}</strong>
      </h1>

      <GoalForm goal={goal} />
    </main>
  )
}
