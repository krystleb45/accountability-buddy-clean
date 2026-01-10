"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  differenceInCalendarDays,
  format,
  formatDistanceToNow,
  isAfter,
} from "date-fns"
import {
  ArrowLeft,
  Clock,
  Loader,
  Pencil,
  Tag,
  Trash,
  TrendingUp,
  XCircle,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo } from "react"
import { toast } from "sonner"

import { deleteGoal, fetchGoalDetails } from "@/api/goal/goal-api"
import { GoalPriority } from "@/components/goals/goal-priority"
import { GoalProgress } from "@/components/goals/goal-progress"
import { GoalStatus } from "@/components/goals/goal-status"
import { GoalTrackProgressDialog } from "@/components/goals/goal-track-progress-dialog"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { useSubscription } from "@/hooks/useSubscription"
import { cn } from "@/lib/utils"
import { RemindersList } from "@/components/reminders"

interface GoalClientProps {
  id: string
}

function GoalClient({ id }: GoalClientProps) {
  const { isSubscriptionActive, isLoading } = useSubscription()

  const { data, isPending, error } = useQuery({
    queryKey: ["goals", id],
    queryFn: () => fetchGoalDetails(id),
  })

  const isOverdue = useMemo(
    () => (data ? isAfter(new Date(), data.dueDate) && data.isActive : false),
    [data],
  )
  const dueSoon = useMemo(
    () =>
      data
        ? !isOverdue &&
          data.isActive &&
          differenceInCalendarDays(data.dueDate, new Date()) <= 3
        : false,
    [data, isOverdue],
  )

  const router = useRouter()
  const queryClient = useQueryClient()

  const { mutate: deleteGoalMutate, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteGoal(id),
    onSuccess: () => {
      toast.success("Goal deleted successfully")
      queryClient.invalidateQueries({
        queryKey: ["goals"],
      })
      router.push("/goals")
    },
    onError: (error) => {
      toast.error("There was an error deleting the goal.", {
        description: error.message,
      })
    },
  })

  if ((isPending && isSubscriptionActive) || isLoading) {
    return (
      <main className="grid min-h-screen place-items-center">
        <LoadingSpinner />
      </main>
    )
  }

  if (error || !data) {
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
    <main className="flex flex-col gap-10">
      <Button variant="link" size="sm" asChild className="self-start !px-0">
        <Link href="/goals">
          <ArrowLeft /> Back to Goals
        </Link>
      </Button>
      <header className="flex items-center justify-between gap-6">
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Badge variant="secondary" className="font-bold text-primary">
              {data.points} XP
            </Badge>
            {(isOverdue || dueSoon) && (
              <Badge variant={isOverdue ? "destructive" : "warning"}>
                {isOverdue ? "Overdue" : "Due Soon"}
              </Badge>
            )}
            {data.visibility === "public" && <Badge>Public</Badge>}
          </div>
          <div className="flex items-center gap-2">
            <GoalStatus status={data.status} className="[&_svg]:size-7" />{" "}
            <h2 className="text-3xl font-bold">{data.title}</h2>
          </div>
          {data.description && (
            <p className="mt-2 text-muted-foreground">{data.description}</p>
          )}
          {data.tags.length > 0 ? (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Tag size={20} className="rotate-y-180 text-muted-foreground" />
              {data.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-sm">
                  {tag}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>
        <div className="flex flex-col justify-end gap-2">
          {data.isActive && (
            <GoalTrackProgressDialog
              goalId={id}
              goalTitle={data.title}
              currentProgress={data.progress ?? 0}
            >
              <Button>
                <TrendingUp /> Track Progress
              </Button>
            </GoalTrackProgressDialog>
          )}
          <div className="flex gap-2">
            {data.isActive && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/goals/${id}/edit`}>
                  <Pencil />
                  Edit
                </Link>
              </Button>
            )}
            <DeleteConfirmationDialog
              onConfirm={deleteGoalMutate}
              title="Are you sure you want to delete this goal?"
            >
              <Button variant="destructive" size="sm">
                {isDeleting ? <Loader className="animate-spin" /> : <Trash />}
                Delete
              </Button>
            </DeleteConfirmationDialog>
          </div>
        </div>
      </header>
      <section className="mt-6 flex flex-wrap justify-between gap-8">
        <div>
          <p
            className={`
              flex items-center gap-2 text-xs font-semibold tracking-widest
              text-muted-foreground uppercase
              [&_svg]:size-4
            `}
          >
            <Clock /> Due Date
          </p>
          <p className="mt-2 text-xl font-semibold">
            {format(data.dueDate, "PP")}
          </p>
          <p
            className={cn("mt-1", {
              "text-destructive": isOverdue,
              "text-chart-3": dueSoon,
            })}
          >
            {formatDistanceToNow(data.dueDate, { addSuffix: true })}
          </p>
        </div>
        <div>
          <p
            className={`
              flex items-center gap-2 text-xs font-semibold tracking-widest
              text-muted-foreground uppercase
              [&_svg]:size-4
            `}
          >
            Priority
          </p>
          <GoalPriority
            priority={data.priority}
            className={`
              mt-2 text-sm
              [&>svg]:size-5
            `}
          />
        </div>
        <div>
          <p
            className={`
              flex items-center gap-2 text-xs font-semibold tracking-widest
              text-muted-foreground uppercase
              [&_svg]:size-4
            `}
          >
            Category
          </p>
          <p className="mt-2 text-xl font-semibold">{data.category}</p>
        </div>
      </section>
      <section>
        <div>
          <p
            className={`
              flex items-center gap-2 text-xs font-semibold tracking-widest
              text-muted-foreground uppercase
              [&_svg]:size-4
            `}
          >
            Progress
          </p>
          <GoalProgress progress={data.progress} className="mt-2" />
        </div>
      </section>

      {/* Reminders Section */}
      <section>
        <RemindersList goalId={id} goalTitle={data.title} />
      </section>
    </main>
  )
}

export default GoalClient
