// src/hooks/useResetPassword.ts
import type { AxiosError } from "axios"

import axios from "axios"
import { useCallback, useState } from "react"

interface UseResetPasswordResult {
  loading: boolean
  error: string | null
  success: string | null
  reset: (token: string, newPassword: string) => Promise<void>
}

export function useResetPassword(): UseResetPasswordResult {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const reset = useCallback(async (token: string, password: string) => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const { data } = await axios.post<{ message?: string }>(
        `/api/auth/reset-password/${token}`,
        {
          password,
        },
      )
      setSuccess(data.message ?? "Password successfully reset!")
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          (err as AxiosError<{ message: string }>).response?.data?.message ||
            "Failed to reset password.",
        )
      } else {
        setError("An unexpected error occurred.")
      }
    } finally {
      setLoading(false)
    }
  }, [])

  return { loading, error, success, reset }
}
