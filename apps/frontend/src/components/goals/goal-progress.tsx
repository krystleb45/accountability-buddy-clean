import type { Goal } from "@/types/mongoose.gen"

import { Progress } from "../ui/progress"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip"

interface GoalProgressProps {
  progress: Goal["progress"]
  className?: string
}

export function GoalProgress({ progress, className }: GoalProgressProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Progress value={progress || 0} max={100} className={className} />
        </TooltipTrigger>
        <TooltipContent>{progress}%</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
