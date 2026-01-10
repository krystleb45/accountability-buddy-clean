import mailchimp from "@mailchimp/mailchimp_transactional"

import { logger } from "../../utils/winston-logger.js"
import type { WeeklyDigestData } from "./digest-service.js"

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

/**
 * Sends a weekly digest email to a user.
 */
export async function sendWeeklyDigestEmail(data: WeeklyDigestData): Promise<void> {
  const { username, email, stats, upcomingDeadlines, recentBadges, weeklyActivity } = data
  
  const subject = `📊 Your Weekly Progress Report - Accountability Buddy`

  const deadlinesHtml = upcomingDeadlines.length > 0
    ? upcomingDeadlines.map(d => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${d.title}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${new Date(d.dueDate).toLocaleDateString()}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${d.progress}%</td>
        </tr>
      `).join("")
    : `<tr><td colspan="3" style="padding: 16px; text-align: center; color: #666;">No upcoming deadlines - great job staying on top of things! 🎉</td></tr>`

  const badgesHtml = recentBadges.length > 0
    ? recentBadges.map(b => `
        <span style="display: inline-block; background: #fef3c7; color: #92400e; padding: 4px 12px; border-radius: 16px; margin: 4px; font-size: 14px;">
          🏆 ${b.name} (${b.level})
        </span>
      `).join("")
    : `<p style="color: #666;">Keep going - badges are waiting to be earned!</p>`

  const motivationalMessages = [
    "Every step forward is progress. Keep going! 💪",
    "You're building something amazing, one goal at a time! 🚀",
    "Consistency is key, and you're doing great! ⭐",
    "Small progress is still progress. Be proud! 🎯",
    "Your dedication inspires others. Keep it up! 🌟",
  ]
  const motivation = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: #4ade80; padding: 30px; text-align: center; }
        .content { background: #ffffff; padding: 30px; }
        .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin: 20px 0; }
        .stat-box { background: #f8fafc; padding: 16px; border-radius: 8px; text-align: center; }
        .stat-value { font-size: 28px; font-weight: bold; color: #4ade80; }
        .stat-label { font-size: 12px; color: #666; text-transform: uppercase; }
        .section { margin: 24px 0; }
        .section-title { font-size: 18px; font-weight: bold; color: #1a1a2e; margin-bottom: 12px; border-bottom: 2px solid #4ade80; padding-bottom: 8px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #f1f5f9; padding: 10px; text-align: left; font-size: 12px; text-transform: uppercase; }
        .motivation { background: #ecfdf5; border-left: 4px solid #4ade80; padding: 16px; margin: 20px 0; font-style: italic; }
        .button { display: inline-block; background: #4ade80; color: #1a1a2e; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">📊 Weekly Progress Report</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Hey ${username}, here's how you did this week!</p>
        </div>
        
        <div class="content">
          <!-- Stats Grid -->
          <div style="display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 24px;">
            <div style="flex: 1; min-width: 120px; background: #f0fdf4; padding: 16px; border-radius: 8px; text-align: center;">
              <div style="font-size: 28px; font-weight: bold; color: #16a34a;">🔥 ${stats.currentStreak}</div>
              <div style="font-size: 12px; color: #666;">Day Streak</div>
            </div>
            <div style="flex: 1; min-width: 120px; background: #fef3c7; padding: 16px; border-radius: 8px; text-align: center;">
              <div style="font-size: 28px; font-weight: bold; color: #d97706;">✅ ${stats.completedThisWeek}</div>
              <div style="font-size: 12px; color: #666;">Completed</div>
            </div>
            <div style="flex: 1; min-width: 120px; background: #dbeafe; padding: 16px; border-radius: 8px; text-align: center;">
              <div style="font-size: 28px; font-weight: bold; color: #2563eb;">⭐ ${stats.totalXP}</div>
              <div style="font-size: 12px; color: #666;">Total XP</div>
            </div>
            <div style="flex: 1; min-width: 120px; background: #f3e8ff; padding: 16px; border-radius: 8px; text-align: center;">
              <div style="font-size: 28px; font-weight: bold; color: #9333ea;">📈 Lv.${stats.level}</div>
              <div style="font-size: 12px; color: #666;">Level</div>
            </div>
          </div>

          <!-- Weekly Activity -->
          <div class="section">
            <div class="section-title">📅 This Week's Activity</div>
            <p>You created <strong>${weeklyActivity.goalsCreated}</strong> new goals and made <strong>${weeklyActivity.progressUpdates}</strong> progress updates. ${stats.inProgress} goals are currently in progress.</p>
          </div>

          <!-- Upcoming Deadlines -->
          <div class="section">
            <div class="section-title">⏰ Upcoming Deadlines</div>
            <table>
              <thead>
                <tr>
                  <th>Goal</th>
                  <th>Due Date</th>
                  <th>Progress</th>
                </tr>
              </thead>
              <tbody>
                ${deadlinesHtml}
              </tbody>
            </table>
          </div>

          <!-- Recent Badges -->
          <div class="section">
            <div class="section-title">🏆 Badges Earned</div>
            ${badgesHtml}
          </div>

          <!-- Motivation -->
          <div class="motivation">
            "${motivation}"
          </div>

          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'https://www.accountabilitybuddys.com'}/dashboard" class="button">
              View Your Dashboard →
            </a>
          </div>
        </div>

        <div class="footer">
          <p>You're receiving this because you have weekly digests enabled.</p>
          <p><a href="${process.env.FRONTEND_URL || 'https://www.accountabilitybuddys.com'}/settings">Manage email preferences</a></p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
    Weekly Progress Report - Accountability Buddy
    
    Hey ${username}!
    
    Here's your weekly summary:
    - Current Streak: ${stats.currentStreak} days
    - Goals Completed: ${stats.completedThisWeek}
    - Total XP: ${stats.totalXP}
    - Level: ${stats.level}
    
    ${motivation}
    
    View your dashboard: ${process.env.FRONTEND_URL || 'https://www.accountabilitybuddys.com'}/dashboard
  `

  await sendHtmlEmail(email, subject, html, text)
}