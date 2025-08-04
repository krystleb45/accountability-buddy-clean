// src/context/settings/FormErrorContext.tsx
"use client"

import type { ReactNode } from "react"

import React, {
  createContext,
  use,
  useCallback,
  useMemo,
  useState,
} from "react"

// Define a type-safe structure for form errors
type FormErrors = Record<string, string>

// Define the context type
interface FormErrorContextType {
  formErrors: FormErrors
  errorCount: number
  addError: (field: string, message: string) => void
  removeError: (field: string) => void
  clearErrors: () => void
  hasErrors: () => boolean
}

// Create the FormErrorContext with an undefined initial value
const FormErrorContext = createContext<FormErrorContextType | undefined>(
  undefined,
)

// Custom hook to use FormErrorContext
export function useFormError(): FormErrorContextType {
  const context = use(FormErrorContext)
  if (!context) {
    throw new Error("useFormError must be used within a FormErrorProvider")
  }
  return context
}

// FormErrorProvider component props
interface FormErrorProviderProps {
  children: ReactNode
}

// FormErrorProvider component
export const FormErrorProvider: React.FC<FormErrorProviderProps> = ({
  children,
}) => {
  const [formErrors, setFormErrors] = useState<FormErrors>({})

  // Compute number of errors
  const errorCount = useMemo(() => Object.keys(formErrors).length, [formErrors])

  /**
   * Add or overwrite an error for a specific field.
   */
  const addError = useCallback((field: string, message: string) => {
    setFormErrors((prev) => ({
      ...prev,
      [field]: message,
    }))
  }, [])

  /**
   * Remove an error for a specific field.
   */
  const removeError = useCallback((field: string) => {
    setFormErrors((prev) => {
      if (!(field in prev)) return prev
      const updated = { ...prev }
      delete updated[field]
      return updated
    })
  }, [])

  /**
   * Clear all errors.
   */
  const clearErrors = useCallback(() => setFormErrors({}), [])

  /**
   * Check if any errors exist.
   */
  const hasErrors = useCallback(() => errorCount > 0, [errorCount])

  return (
    <FormErrorContext
      value={{
        formErrors,
        errorCount,
        addError,
        removeError,
        clearErrors,
        hasErrors,
      }}
    >
      {children}
    </FormErrorContext>
  )
}

export default FormErrorContext
