import type { PropsWithChildren } from "react"

import { Fragment } from "react"

import { Badge } from "../ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import { Copyable } from "./copyable"

interface IdBadgeProps {
  id: string
  isCopyable?: boolean
  showFullId?: boolean
  className?: string
}

const MAX_CHARS_IN_IDS = 8

interface TooltipWrapperProps extends PropsWithChildren {
  value: string
}

export function TooltipWrapper({ value, children }: TooltipWrapperProps) {
  return (
    <Tooltip>
      <TooltipTrigger>{children}</TooltipTrigger>

      <TooltipContent className="font-mono font-medium">{value}</TooltipContent>
    </Tooltip>
  )
}

export function IdBadge({
  id,
  isCopyable = true,
  showFullId = false,
  className,
}: IdBadgeProps) {
  const Wrapper1 = isCopyable ? Copyable : "div"
  const Wrapper2 = showFullId ? Fragment : TooltipWrapper

  return (
    <Wrapper1 value={id} className={className}>
      <Wrapper2 value={id}>
        <Badge variant="outline" className="font-mono font-medium">
          {showFullId ? (
            id
          ) : (
            <>
              {id.slice(0, MAX_CHARS_IN_IDS)}
              {id.length > MAX_CHARS_IN_IDS ? "..." : ""}
            </>
          )}
        </Badge>
      </Wrapper2>
    </Wrapper1>
  )
}
