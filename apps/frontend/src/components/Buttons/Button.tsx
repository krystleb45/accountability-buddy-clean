// components/Buttons/Button.tsx
import clsx from "clsx"
import React from "react"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: "primary" | "secondary" | "danger" | "outline"
  size?: "sm" | "md" | "lg"
  loading?: boolean
}

const baseStyles =
  "inline-flex items-center justify-center font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"

// explicitly list out all the keys here:
const variantStyles: Record<
  "primary" | "secondary" | "danger" | "outline",
  string
> = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
  secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-300",
  danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  outline:
    "border border-gray-300 text-gray-800 hover:bg-gray-100 focus:ring-gray-300",
}

const sizeStyles: Record<"sm" | "md" | "lg", string> = {
  sm: "px-3 py-1 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-5 py-3 text-lg",
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className,
  ...props
}) => {
  const isDisabled = disabled || loading

  return (
    <button
      className={clsx(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      disabled={isDisabled}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <span
          className={`
            mr-2 size-4 animate-spin rounded-full border-2 border-current
            border-t-transparent
          `}
          role="status"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  )
}

export default Button
