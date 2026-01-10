import mailchimp from "@mailchimp/mailchimp_transactional"

import { logger } from "../../utils/winston-logger.js"

const mailchimpClient = mailchimp(process.env.MAILCHIMP_TRANSACTIONAL_API_KEY!)

export async function emailServiceHealthCheck(): Promise<boolean> {
  const res = await mailchimpClient.users.ping()

  if (res instanceof Error) {
    logger.error(
      "❌ Email service is unhealthy:",
      res.response?.data || res.message,
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
    logger.error("❌ Failed to send email:", res.response?.data || res.message)
    throw new TypeError("❌ Failed to send email")
  }
}
/**
 * Sends a reminder email for a goal.
 * @param to - Recipient email address.
 * @param message - Reminder message.
 * @param goalTitle - Optional goal title.
 */
export async function sendReminderEmail(
  to: string,
  message: string,
  goalTitle?: string,
): Promise<void> {
  const subject = goalTitle 
    ? `⏰ Reminder: ${goalTitle}` 
    : "⏰ Accountability Buddy Reminder"

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1a1a2e; color: #4ade80; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .message { background: white; padding: 20px; border-left: 4px solid #4ade80; margin: 20px 0; }
        .button { display: inline-block; background: #4ade80; color: #1a1a2e; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ Reminder</h1>
        </div>
        <div class="content">
          ${goalTitle ? `<h2>Goal: ${goalTitle}</h2>` : ""}
          <div class="message">
            <p>${message}</p>
          </div>
          <p style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'https://www.accountabilitybuddys.com'}/goals" class="button">
              View Your Goals
            </a>
          </p>
        </div>
        <div class="footer">
          <p>You're receiving this because you set a reminder on Accountability Buddy.</p>
          <p>Keep pushing towards your goals! 💪</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
    Reminder${goalTitle ? `: ${goalTitle}` : ""}
    
    ${message}
    
    View your goals: ${process.env.FRONTEND_URL || 'https://www.accountabilitybuddys.com'}/goals
  `

  await sendHtmlEmail(to, subject, html, text)
  logger.info(`📧 Reminder email sent to ${to}`)
}