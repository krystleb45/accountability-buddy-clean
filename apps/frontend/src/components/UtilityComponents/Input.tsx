import clsx from "clsx"
import React, { useId } from "react"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string
}

function Input({
  ref,
  className,
  id,
  "aria-invalid": ariaInvalid,
  type = "text",
  ...props
}: InputProps & { ref?: React.RefObject<HTMLInputElement | null> }) {
  const autoId = useId()
  const resolvedId = id || `input-${autoId}`

  return (
    <input
      id={resolvedId}
      type={type}
      ref={ref}
      aria-invalid={ariaInvalid}
      className={clsx(
        "w-full rounded-md border border-gray-300 px-4 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-gray-100",
        // validity styling (optional)
        ariaInvalid && "border-red-500 focus:ring-red-200",
        className,
      )}
      {...props}
    />
  )
}

Input.displayName = "Input"

export default Input
