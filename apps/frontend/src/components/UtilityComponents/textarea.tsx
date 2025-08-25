// File: components/ui/textarea.tsx

import * as React from "react"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string
}

export function Textarea({
  ref,
  className = "",
  ...props
}: TextareaProps & { ref?: React.RefObject<HTMLTextAreaElement | null> }) {
  return (
    <textarea
      ref={ref}
      className={`
        w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm
        transition-shadow
        placeholder:text-gray-500
        focus:ring-2 focus:ring-blue-600 focus:outline-none
        ${className}
      `}
      {...props}
    />
  )
}

Textarea.displayName = "Textarea"
