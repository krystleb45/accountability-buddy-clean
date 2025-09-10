import type { PropsWithChildren } from "react"

import { Copy, CopyCheck } from "lucide-react"

import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { cn } from "@/lib/utils"

import { Button } from "./button"

interface CopyableProps extends PropsWithChildren {
  value: string
  showAlways?: boolean
  className?: string | undefined
}

export function Copyable({
  children,
  value,
  showAlways = false,
  className,
}: CopyableProps) {
  const [copy, isCopied] = useCopyToClipboard()

  return (
    <div className={cn("group/copyable flex items-center gap-2", className)}>
      {children}

      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          copy(value)
        }}
        className={cn({
          "pointer-events-none opacity-0 transition-opacity group-hover/copyable:pointer-events-auto group-hover/copyable:opacity-100":
            !showAlways,
        })}
      >
        {isCopied ? <CopyCheck /> : <Copy />}
      </Button>
    </div>
  )
}
