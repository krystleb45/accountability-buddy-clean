import type { Metadata } from "next"

import { Suspense } from "react" // Add Suspense import

import ResetPasswordForm from "./page.client"

export const metadata: Metadata = {
  title: "Reset Password • Accountability Buddy",
  description: "Enter your new password to complete the reset process.",
  openGraph: {
    title: "Reset Password • Accountability Buddy",
    description: "Enter your new password to complete the reset process.",
    url: "https://your-domain.com/reset-password",
    siteName: "Accountability Buddy",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reset Password • Accountability Buddy",
    description: "Enter your new password to complete the reset process.",
  },
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mb-4 text-2xl">🔐</div>
            <div>Loading reset form...</div>
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}
