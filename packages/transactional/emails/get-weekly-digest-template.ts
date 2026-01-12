import { render } from "@react-email/render"

import { WeeklyDigest } from "./weekly-digest.js"

interface WeeklyDigestParams {
  username: string
  logoUrl?: string
  stats: {
    totalGoals: number
    completedThisWeek: number
    inProgress: number
    currentStreak: number
    longestStreak: number
    totalXP: number
    level: number
  }
  upcomingDeadlines: Array<{
    title: string
    dueDate: Date
    progress: number
  }>
  recentBadges: Array<{
    name: string
    level: string
    dateAwarded: Date
  }>
  weeklyActivity: {
    goalsCreated: number
    progressUpdates: number
  }
  dashboardUrl?: string
}

export async function getWeeklyDigestTemplate(params: WeeklyDigestParams) {
  const html = await render(WeeklyDigest(params))
  const text = `
Your Weekly Progress Report

Hey ${params.username}! Here's how you did this week.

STATS
- Completed this week: ${params.stats.completedThisWeek}
- In progress: ${params.stats.inProgress}
- Current streak: ${params.stats.currentStreak} days
- Level: ${params.stats.level} (${params.stats.totalXP} XP)

${params.upcomingDeadlines.length > 0 ? `UPCOMING DEADLINES
${params.upcomingDeadlines.map(d => `- ${d.title} (${d.progress}% complete)`).join('\n')}
` : ''}
${params.recentBadges.length > 0 ? `BADGES EARNED
${params.recentBadges.map(b => `- ${b.name} (${b.level})`).join('\n')}
` : ''}
THIS WEEK'S ACTIVITY
- ${params.weeklyActivity.goalsCreated} new goals created
- ${params.weeklyActivity.progressUpdates} progress updates made

View your dashboard: ${params.dashboardUrl || 'https://accountabilitybuddys.com/dashboard'}

Keep up the great work! Every step counts towards your goals.
  `.trim()

  return { html, text }
}
