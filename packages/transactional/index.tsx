import { render, toPlainText } from "@react-email/components"
import VerifyEmail from "./emails/verify-email"

export async function getVerifyEmailTemplate(link: string, logoUrl?: string) {
  const html = await render(<VerifyEmail link={link} logoUrl={logoUrl} />)
  const text = toPlainText(html)
  return { html, text }
}
