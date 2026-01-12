"use client"

import { Check, X } from "lucide-react"
import { useMemo } from "react"

import { cn } from "@/lib/utils"

interface PasswordRequirementsProps {
  password: string
  className?: string
}

interface Requirement {
  label: string
  test: (password: string) => boolean
}

const requirements: Requirement[] = [
  {
    label: "At least 8 characters",
    test: (pw) => pw.length >= 8,
  },
  {
    label: "Contains a number",
    test: (pw) => /\d/.test(pw),
  },
  {
    label: "Contains an uppercase letter",
    test: (pw) => /[A-Z]/.test(pw),
  },
  {
    label: "Contains a special character (!@#$%^&*)",
    test: (pw) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw),
  },
]

export function PasswordRequirements({
  password,
  className,
}: PasswordRequirementsProps) {
  const results = useMemo(
    () =>
      requirements.map((req) => ({
        ...req,
        met: req.test(password),
      })),
    [password],
  )

  // Don't show anything if password is empty
  if (!password) {
    return (
      <div className={cn("mt-2 space-y-1 text-xs text-muted-foreground", className)}>
        <p className="font-medium">Password must contain:</p>
        <ul className="space-y-1 pl-1">
          {requirements.map((req) => (
            <li key={req.label} className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full border border-muted-foreground/50" />
              <span>{req.label}</span>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className={cn("mt-2 space-y-1 text-xs", className)}>
      <p className="font-medium text-muted-foreground">Password must contain:</p>
      <ul className="space-y-1 pl-1">
        {results.map((req) => (
          <li
            key={req.label}
            className={cn(
              "flex items-center gap-2 transition-colors",
              req.met ? "text-green-600 dark:text-green-500" : "text-red-500",
            )}
          >
            {req.met ? (
              <Check className="h-3 w-3" />
            ) : (
              <X className="h-3 w-3" />
            )}
            <span>{req.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Export the validation function for use in Zod schemas
export function isValidPassword(password: string): boolean {
  return requirements.every((req) => req.test(password))
}

// Export individual validators for custom Zod schema
export const passwordValidators = {
  minLength: (pw: string) => pw.length >= 8,
  hasNumber: (pw: string) => /\d/.test(pw),
  hasUppercase: (pw: string) => /[A-Z]/.test(pw),
  hasSpecialChar: (pw: string) =>
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw),
}
