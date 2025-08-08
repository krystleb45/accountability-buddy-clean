import type { Metadata } from "next"

import { ForgotPasswordForm } from "./forgot-password-form"

export const metadata: Metadata = {
  title: "Forgot Password • Accountability Buddy",
  description: "Request a password reset link to your registered email.",
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />
}
