import type { Metadata } from "next"

import ResetPasswordForm from "./reset-password-form"

export const metadata: Metadata = {
  title: "Reset Password • Accountability Buddy",
  description: "Enter your new password to complete the reset process.",
}

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  return <ResetPasswordForm token={token} />
}
