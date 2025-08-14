"use client"

import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { LoadingSpinner } from "@/components/loading-spinner"
import { useAuth } from "@/context/auth/auth-context"
import { http } from "@/utils"

interface VerificationComponentProps {
  token: string
}

export function VerificationComponent({ token }: VerificationComponentProps) {
  const router = useRouter()
  const { refetchUser } = useAuth()

  const { isPending, error, isSuccess } = useQuery({
    queryKey: ["verify-email", token],
    queryFn: () =>
      http.get("/auth/verify-email", {
        params: { token },
      }),
  })

  if (isPending) {
    return <LoadingSpinner />
  }

  if (error) {
    toast.error(error.message, {
      duration: 5000,
    })
  }

  if (isSuccess) {
    toast.success("Email verified successfully!", {
      duration: 5000,
    })
    refetchUser()
    router.replace("/dashboard")
  }

  return null
}
