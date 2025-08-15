"use client"

import { useMutation } from "@tanstack/react-query"
import { AlertCircle, Loader, Send } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth/auth-context"
import { http } from "@/utils"

export function VerifyEmailBanner() {
  const { user, loading } = useAuth()

  const { mutate: sendVerificationEmail, isPending: sendingVerificationEmail } =
    useMutation({
      mutationFn: async () => {
        return http.post("/auth/send-verification-email")
      },
      onSuccess: () => {
        toast.success("Verification email sent successfully!")
      },
      onError: () => {
        toast.error("Failed to send verification email.")
      },
    })

  if (user?.isVerified || loading) {
    return null
  }

  return (
    <div
      className={`
        m-6 flex justify-center rounded-lg border !border-chart-3 bg-chart-3/10
        px-6 py-4
      `}
    >
      <div className="text-center">
        <p className="flex items-center gap-2 text-xl font-bold">
          <AlertCircle size={28} className="text-chart-3" /> Please verify your
          email address to access all features of the application.
        </p>
        <Button
          variant="outline"
          className={`
            group mt-4 !border-chart-3
            hover:!border-primary
          `}
          onClick={() => sendVerificationEmail()}
          disabled={sendingVerificationEmail}
        >
          Resend Verification Email{" "}
          {sendingVerificationEmail ? (
            <Loader className="animate-spin" />
          ) : (
            <Send
              className={`
                transition-transform
                group-hover:rotate-45
              `}
            />
          )}
        </Button>
      </div>
    </div>
  )
}
