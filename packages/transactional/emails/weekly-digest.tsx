import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components"

import { colors } from "../colors.js"

const main = {
  backgroundColor: colors.background,
  margin: "0 auto",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
}

const container = {
  margin: "0 auto",
  padding: "0px 20px",
  textAlign: "center" as const,
}

const logoContainer = {
  marginTop: "32px",
}

const h1 = {
  color: colors.foreground,
  fontSize: "32px",
  fontWeight: "700",
  margin: "30px 0 10px",
  padding: "0",
  lineHeight: "38px",
}

const h2 = {
  color: colors.foreground,
  fontSize: "20px",
  fontWeight: "600",
  margin: "24px 0 12px",
  padding: "0",
  lineHeight: "28px",
  textAlign: "left" as const,
}

const heroText = {
  fontSize: "16px",
  lineHeight: "24px",
  marginBottom: "24px",
  color: colors.mutedForeground || "#a1a1aa",
}

const statsGrid = {
  margin: "24px 0",
  textAlign: "center" as const,
}

const statBox = {
  display: "inline-block",
  width: "120px",
  padding: "16px",
  margin: "8px",
  backgroundColor: colors.card || "#1c1c1e",
  borderRadius: "12px",
  verticalAlign: "top",
}

const statNumber = {
  fontSize: "28px",
  fontWeight: "700",
  color: colors.primary,
  margin: "0",
  lineHeight: "32px",
}

const statLabel = {
  fontSize: "12px",
  color: colors.mutedForeground || "#a1a1aa",
  margin: "4px 0 0",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
}

const listItem = {
  fontSize: "14px",
  lineHeight: "24px",
  color: colors.foreground,
  textAlign: "left" as const,
  padding: "8px 0",
  borderBottom: `1px solid ${colors.border || "#27272a"}`,
}

const listItemTitle = {
  fontWeight: "600",
  color: colors.foreground,
}

const listItemMeta = {
  fontSize: "12px",
  color: colors.mutedForeground || "#a1a1aa",
}

const buttonSection = {
  margin: "32px 0",
}

const hr = {
  borderColor: colors.border || "#27272a",
  margin: "24px 0",
}

const footer = {
  fontSize: "12px",
  color: colors.mutedForeground || "#a1a1aa",
  marginTop: "32px",
  marginBottom: "32px",
}

interface UpcomingDeadline {
  title: string
  dueDate: Date
  progress: number
}

interface RecentBadge {
  name: string
  level: string
  dateAwarded: Date
}

interface WeeklyDigestProps {
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
  upcomingDeadlines: UpcomingDeadline[]
  recentBadges: RecentBadge[]
  weeklyActivity: {
    goalsCreated: number
    progressUpdates: number
  }
  dashboardUrl?: string
}

export function WeeklyDigest({
  username,
  logoUrl,
  stats,
  upcomingDeadlines,
  recentBadges,
  weeklyActivity,
  dashboardUrl = "https://accountabilitybuddys.com/dashboard",
}: WeeklyDigestProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  const getDaysLeft = (date: Date) => {
    const days = Math.ceil(
      (new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
    if (days === 0) return "Today"
    if (days === 1) return "Tomorrow"
    return `${days} days left`
  }

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Preview>
          Your weekly progress: {stats.completedThisWeek} goals completed, {stats.currentStreak} day streak 🔥
        </Preview>
        <Container style={container}>
          {logoUrl && (
            <Section style={logoContainer}>
              <Img
                src={logoUrl}
                width="36"
                height="36"
                alt="Accountability Buddy Logo"
                style={{
                  display: "block",
                  margin: "0 auto",
                }}
              />
            </Section>
          )}

          <Heading style={h1}>Your Weekly Progress Report 📊</Heading>
          <Text style={heroText}>
            Hey {username}! Here's how you did this week.
          </Text>

          {/* Stats Grid */}
          <Section style={statsGrid}>
            <div style={statBox}>
              <Text style={statNumber}>{stats.completedThisWeek}</Text>
              <Text style={statLabel}>Completed</Text>
            </div>
            <div style={statBox}>
              <Text style={statNumber}>{stats.inProgress}</Text>
              <Text style={statLabel}>In Progress</Text>
            </div>
            <div style={statBox}>
              <Text style={statNumber}>{stats.currentStreak}🔥</Text>
              <Text style={statLabel}>Day Streak</Text>
            </div>
            <div style={statBox}>
              <Text style={statNumber}>Lv.{stats.level}</Text>
              <Text style={statLabel}>{stats.totalXP} XP</Text>
            </div>
          </Section>

          <Hr style={hr} />

          {/* Upcoming Deadlines */}
          {upcomingDeadlines.length > 0 && (
            <Section>
              <Heading style={h2}>⏰ Upcoming Deadlines</Heading>
              {upcomingDeadlines.map((goal, index) => (
                <div key={index} style={listItem}>
                  <Text style={{ margin: 0 }}>
                    <span style={listItemTitle}>{goal.title}</span>
                    <br />
                    <span style={listItemMeta}>
                      {formatDate(goal.dueDate)} · {getDaysLeft(goal.dueDate)} · {goal.progress}% complete
                    </span>
                  </Text>
                </div>
              ))}
            </Section>
          )}

          {/* Recent Badges */}
          {recentBadges.length > 0 && (
            <Section>
              <Heading style={h2}>🏆 Badges Earned</Heading>
              {recentBadges.map((badge, index) => (
                <div key={index} style={listItem}>
                  <Text style={{ margin: 0 }}>
                    <span style={listItemTitle}>{badge.name}</span>
                    <br />
                    <span style={listItemMeta}>
                      {badge.level} · {formatDate(badge.dateAwarded)}
                    </span>
                  </Text>
                </div>
              ))}
            </Section>
          )}

          {/* Weekly Activity Summary */}
          <Section>
            <Heading style={h2}>📈 This Week's Activity</Heading>
            <Text style={{ ...heroText, textAlign: "left" as const, margin: "8px 0" }}>
              • {weeklyActivity.goalsCreated} new goals created
              <br />
              • {weeklyActivity.progressUpdates} progress updates made
              <br />
              • Longest streak: {stats.longestStreak} days
            </Text>
          </Section>

          <Hr style={hr} />

          {/* CTA Button */}
          <Section style={buttonSection}>
            <Button
              href={dashboardUrl}
              style={{
                color: colors.background,
                backgroundColor: colors.primary,
                padding: "16px 32px",
                fontSize: "16px",
                fontWeight: "500",
                borderRadius: "8px",
              }}
            >
              View Dashboard
            </Button>
          </Section>

          {/* Footer */}
          <Text style={footer}>
            Keep up the great work! Every step counts towards your goals.
            <br />
            <br />
            You're receiving this because you have Weekly Progress Digest enabled.
            <br />
            <a
              href={`${dashboardUrl.replace("/dashboard", "/settings")}`}
              style={{ color: colors.primary }}
            >
              Manage notification preferences
            </a>
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

WeeklyDigest.PreviewProps = {
  username: "John",
  logoUrl: "http://localhost:3000/logo.png",
  stats: {
    totalGoals: 12,
    completedThisWeek: 3,
    inProgress: 4,
    currentStreak: 7,
    longestStreak: 14,
    totalXP: 450,
    level: 5,
  },
  upcomingDeadlines: [
    { title: "Finish project proposal", dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), progress: 75 },
    { title: "Read 2 chapters", dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), progress: 50 },
  ],
  recentBadges: [
    { name: "Goal Crusher", level: "Gold", dateAwarded: new Date() },
  ],
  weeklyActivity: {
    goalsCreated: 2,
    progressUpdates: 8,
  },
  dashboardUrl: "https://accountabilitybuddys.com/dashboard",
} as WeeklyDigestProps

export default WeeklyDigest
