import { SignalHigh, SignalLow, SignalMedium } from "lucide-react"

import type { Goal } from "@/types/mongoose.gen"

import { cn } from "@/lib/utils"

import { Badge } from "../ui/badge"

interface GoalPriorityProps {
  priority: Goal["priority"]
  className?: string
}

export function GoalPriority({ priority, className }: GoalPriorityProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        `
          text-2xs leading-none font-semibold tracking-widest uppercase
          [&>svg]:size-4
        `,
        {
          "border-destructive text-destructive": priority === "high",
          "border-chart-3 text-chart-3": priority === "medium",
          "border-muted-foreground text-muted-foreground": priority === "low",
        },
        className,
      )}
    >
      <SignalHigh
        className={cn({
          hidden: priority !== "high",
        })}
      />
      <SignalMedium
        className={cn({
          hidden: priority !== "medium",
        })}
      />
      <SignalLow
        className={cn({
          hidden: priority !== "low",
        })}
      />
      {priority}
    </Badge>
  )
}
