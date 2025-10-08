import type { ReactNode } from "react"

import { Archive, CircleCheck, CircleDashed, CircleDot } from "lucide-react"

import type { Goal } from "@/types/mongoose.gen"

import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"

interface GoalStatusProps {
  status: Goal["status"]
  className?: string
}

export function GoalStatus({ status, className }: GoalStatusProps) {
  let Icon: ReactNode = <Archive className="text-muted-foreground" />

  switch (status) {
    case "archived":
      Icon = <Archive className="text-muted-foreground" />
      break

    case "not-started":
      Icon = <CircleDashed />
      break

    case "in-progress":
      Icon = <CircleDot className="text-chart-3" />
      break

    case "completed":
      Icon = <CircleCheck className="text-primary" />
      break

    default:
      Icon = null
  }

  return (
    <Tooltip>
      <TooltipTrigger className={className}>{Icon}</TooltipTrigger>
      <TooltipContent className="capitalize" collisionPadding={24}>
        {status?.replaceAll("-", " ")}
      </TooltipContent>
    </Tooltip>
  )
}
