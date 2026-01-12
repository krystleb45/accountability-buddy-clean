import { render, toPlainText } from "@react-email/components"

import { ResetPassword } from "./emails/reset-password.js"
import VerifyEmail from "./emails/verify-email.js"
// Add this export
export { getWeeklyDigestTemplate } from "./emails/get-weekly-digest-template.js"

export async function getVerifyEmailTemplate(link: string, logoUrl?: string) {
  const props = logoUrl ? { link, logoUrl } : { link }
  const html = await render(<VerifyEmail {...props} />)
  const text = toPlainText(html)
  return { html, text }
}

export async function getResetPasswordTemplate(link: string, logoUrl?: string) {
  const props = logoUrl ? { link, logoUrl } : { link }
  const html = await render(<ResetPassword {...props} />)
  const text = toPlainText(html)
  return { html, text }
}
