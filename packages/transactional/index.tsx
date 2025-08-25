import { render, toPlainText } from "@react-email/components"

import { ResetPassword } from "./emails/reset-password"
import VerifyEmail from "./emails/verify-email"

export async function getVerifyEmailTemplate(link: string, logoUrl?: string) {
  const html = await render(<VerifyEmail link={link} logoUrl={logoUrl} />)
  const text = toPlainText(html)
  return { html, text }
}

export async function getResetPasswordTemplate(link: string, logoUrl?: string) {
  const html = await render(<ResetPassword link={link} logoUrl={logoUrl} />)
  const text = toPlainText(html)
  return { html, text }
}
