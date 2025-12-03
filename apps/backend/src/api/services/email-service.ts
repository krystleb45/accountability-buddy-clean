import mailchimp from "@mailchimp/mailchimp_transactional"

import { logger } from "../../utils/winston-logger.js"

const mailchimpClient = mailchimp(process.env.MAILCHIMP_TRANSACTIONAL_API_KEY)

export async function emailServiceHealthCheck(): Promise<boolean> {
  const res = await mailchimpClient.users.ping()

  if (res instanceof Error) {
    logger.error(
      "❌ Email service is unhealthy:",
      res.response.data || res.message,
    )
    throw new TypeError("❌ Email service is unhealthy")
  }

  return res === "PONG!"
}

/**
 * Sends an email with HTML content.
 * @param to - Recipient email address.
 * @param subject - Email subject.
 * @param html - HTML content for the email.
 * @param text - Optional plain text content for the email.
 * @param options - Additional email options.
 */
export async function sendHtmlEmail(
  to: string,
  subject: string,
  html: string,
  text?: string,
  options: Partial<Omit<mailchimp.MessagesSendRequest, "message">> = {},
): Promise<void> {
  if (!html) {
    throw new Error("HTML content is required for sending an HTML email")
  }

  const res = await mailchimpClient.messages.send({
    message: {
      from_email: process.env.EMAIL_USER!,
      to: [{ email: to }],
      subject,
      html,
      text,
    },
    ...options,
  })

  if (res instanceof Error) {
    logger.error("❌ Failed to send email:", res.response.data || res.message)
    throw new TypeError("❌ Failed to send email")
  }
}
