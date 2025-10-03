import {
  differenceInCalendarDays,
  format,
  formatDistanceToNow,
  isAfter,
} from "date-fns"
import { Clock, Tag } from "lucide-react"

import type { Goal } from "@/types/mongoose.gen"

import { cn } from "@/lib/utils"

import { Badge } from "../ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card"
import { GoalPriority } from "./goal-priority"
import { GoalProgress } from "./goal-progress"
import { GoalStatus } from "./goal-status"

interface GoalCardProps {
  goal: Goal
}

export function GoalCard({ goal }: GoalCardProps) {
  const isOverdue = isAfter(new Date(), goal.dueDate) && goal.isActive
  const dueSoon =
    !isOverdue &&
    goal.isActive &&
    differenceInCalendarDays(goal.dueDate, new Date()) <= 3
  const isCompleted = goal.status === "completed"

  return (
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
          <GoalStatus status={goal.status} />
          <div className="space-y-1">
            <CardTitle>{goal.title}</CardTitle>
            <CardDescription>{goal.description}</CardDescription>
          </div>
        </div>
        <CardAction className="flex gap-2">
          <Badge variant="secondary" className="font-bold text-primary">
            {goal.points} XP
          </Badge>
          {goal.visibility === "public" && <Badge>Public</Badge>}
        </CardAction>
      </CardHeader>
      <CardContent className="mt-auto">
        <div className="flex flex-wrap justify-between gap-6">
          {goal.isActive ? (
            <div>
              <p
                className={`
                  flex items-center gap-2 text-2xs font-semibold tracking-widest
                  text-muted-foreground uppercase
                  [&_svg]:size-4
                `}
              >
                <Clock /> Due Date
              </p>
              <p className="mt-1 font-semibold">{format(goal.dueDate, "PP")}</p>
              <p
                className={cn("mt-1 text-sm", {
                  "text-destructive": isOverdue,
                  "text-chart-3": dueSoon,
                })}
              >
                {formatDistanceToNow(goal.dueDate, {
                  addSuffix: true,
                })}
              </p>
            </div>
          ) : goal.completedAt ? (
            <div>
              <p
                className={`
                  flex items-center gap-2 text-2xs font-semibold tracking-widest
                  text-muted-foreground uppercase
                  [&_svg]:size-4
                `}
              >
                <Clock /> Completed on
              </p>
              <p className="mt-1 font-semibold">
                {format(goal.completedAt, "PP")}
              </p>
              <p className="mt-1 text-sm">
                {formatDistanceToNow(goal.completedAt, {
                  addSuffix: true,
                })}
              </p>
            </div>
          ) : null}
          {goal.priority && (
            <div className="text-right">
              <p
                className={`
                  text-2xs font-semibold tracking-widest text-muted-foreground
                  uppercase
                `}
              >
                Priority
              </p>
              <GoalPriority priority={goal.priority} className="mt-2" />
            </div>
          )}
        </div>
        <div className="mt-6">
          <p
            className={`
              mb-2 text-2xs font-semibold tracking-widest text-muted-foreground
              uppercase
            `}
          >
            Progress
          </p>
          <GoalProgress progress={goal.progress} className="mt-2" />
        </div>
      </CardContent>
      <CardFooter
        className={`
          items-end justify-between gap-6 rounded-b-xl border-t bg-muted !py-4
        `}
      >
        <div>
          <p
            className={`
              text-2xs font-semibold tracking-widest text-muted-foreground
              uppercase
            `}
          >
            Category
          </p>
          <p className="mt-1 text-sm font-semibold">{goal.category}</p>
        </div>
        {goal.tags.length > 0 ? (
          <div className="flex flex-wrap-reverse items-center justify-end gap-2">
            <Tag size={16} className="rotate-y-180 text-muted-foreground" />
            {goal.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}
      </CardFooter>
    </Card>
  )
}
