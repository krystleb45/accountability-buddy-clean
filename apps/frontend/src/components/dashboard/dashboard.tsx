"use client"

import type { LucideIcon } from "lucide-react"

import { formatDistanceToNow } from "date-fns"
import {
  Award,
  BookOpenText,
  ChartBar,
  ChartNoAxesColumnIncreasing,
  Crosshair,
  FileText,
  Flame,
  Goal,
  Handshake,
  Percent,
  Scroll,
  SquareCheckBig,
  Trophy,
  Users,
} from "lucide-react"
import { motion } from "motion/react"
import Image from "next/image"
import Link from "next/link"
import React from "react"

import type { UserBadge } from "@/api/badge/badge-api"
import type { StreakData } from "@/api/goal/goal-api"
import type { DashboardProgress } from "@/api/progress/progress-api"
import type { Activity } from "@/types/mongoose.gen"

import { LeaderboardPreview } from "@/components/Gamification/LeaderboardPreview"
import { cn } from "@/lib/utils"

import { Badge } from "../ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card"
import { Progress } from "../ui/progress"
import DashboardStatCard from "./DashboardStatCard"

type ICard = {
  label: string
  icon: LucideIcon
  subtitle?: string
  content?: React.ReactNode
  containerClassName?: string
} & (
  | {
      link: string
      onClick?: never
    }
  | {
      link?: never
      onClick: () => void
    }
  | {
      link?: never
      onClick?: never
    }
)

export interface DashboardProps {
  userName: string
  userStats: {
    totalGoals: number
    completedGoals: number
    collaborations: number
    completionRate: number
  }
  recentActivities: Activity[]
  userProgress: DashboardProgress
  userBadges: UserBadge[]
  goalsStreakData: StreakData
}

const MotionCard = motion.create(Card)

export function Dashboard({
  userName,
  userStats,
  recentActivities,
  userProgress,
  userBadges,
  goalsStreakData,
}: DashboardProps) {
  const pct = userStats.completionRate
  const pointsToNextLevel = userProgress.pointsToNextLevel
  const nextLevelPoints = pointsToNextLevel + userProgress.points

  const goalsCard: ICard = {
    label: "Goals",
    icon: Goal,
    subtitle: "Track your progress and explore suggested goals.",
    link: "/goals",
    content: (
      <>
        <div className="flex items-baseline justify-between">
          <p
            className={`
              mt-2 flex items-center gap-2 text-lg font-bold text-chart-3
              sm:text-xl
            `}
          >
            {goalsStreakData.dates?.length > 0 ? <Flame /> : null}{" "}
            {goalsStreakData.dates?.length || 0}-Day Streak
          </p>
          <p
            className={`
              mt-6 text-sm text-muted-foreground
              sm:text-base
            `}
          >
            <span className="font-bold text-foreground">{pct.toFixed(1)}%</span>{" "}
            Completed
          </p>
        </div>
        <div className="mt-2 h-4 w-full rounded-lg bg-muted">
          <div
            className="h-full rounded-lg bg-primary"
            style={{ width: `${pct}%` }}
          />
        </div>
      </>
    ),
  }
  // // the other fixed cards
  const otherCards: ICard[] = [
    {
      label: "Your Progress",
      icon: ChartNoAxesColumnIncreasing,
      content: (
        <>
          <div
            className={`
              flex justify-between
              *:flex-1 *:shrink-0
            `}
          >
            <div
              className={`
                flex items-center gap-2 text-sm text-primary
                sm:text-base
              `}
            >
              <span className="flex items-center gap-2 text-xl font-semibold">
                <Crosshair />
                XP:
              </span>
              <p className="text-xl font-bold">{userProgress.points}</p>
            </div>
            <div
              className={`
                flex items-center justify-end gap-2 text-sm text-chart-2
                sm:text-base
              `}
            >
              <span className="flex items-center gap-2 text-xl font-semibold">
                <ChartNoAxesColumnIncreasing />
                Level:
              </span>
              <p className="text-xl font-bold">{userProgress.level}</p>
            </div>
          </div>
          <div className="mt-6 h-3 w-full rounded-full bg-muted">
            <div
              className="h-3 rounded-full bg-primary"
              style={{
                width: `${(userProgress.points / nextLevelPoints) * 100}%`,
              }}
            />
          </div>
          <p
            className={`
              mt-2 text-xs text-muted-foreground
              sm:text-sm
            `}
          >
            {userProgress.pointsToNextLevel ?? 0} XP to next level
          </p>
        </>
      ),
    },
    {
      label: "Your Stats",
      icon: ChartBar,
      subtitle: "Stats Overview",
      link: "/statistics",
      containerClassName: "sm:col-span-2 sm:row-span-2",
      content: (
        <div
          className={`
            grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-3
          `}
        >
          <DashboardStatCard
            title="Total Goals"
            value={userStats.totalGoals}
            icon={<Goal className="text-chart-2" />}
          />
          <DashboardStatCard
            title="Completed Goals"
            value={userStats.completedGoals}
            icon={<SquareCheckBig className="text-chart-1" />}
          />
          <DashboardStatCard
            title="Collaborations"
            value={userStats.collaborations}
            icon={<Users className="text-chart-3" />}
          />
          <DashboardStatCard
            title="Completion Rate"
            value={`${userStats.completionRate.toFixed(1)}%`}
            icon={<Percent className="text-chart-5" />}
          />
        </div>
      ),
    },
    {
      label: "Recent Activities",
      icon: Scroll,
      content:
        recentActivities.length > 0 ? (
          <ul className="flex list-disc flex-col gap-4 pl-6">
            {recentActivities.map((a) => (
              <li key={a._id}>
                <div className="flex items-baseline gap-2">
                  <Badge
                    variant="secondary"
                    className="text-xs font-medium tracking-widest uppercase"
                  >
                    {a.type}
                  </Badge>
                  <span>{a.description}</span>
                </div>
                <div className="mt-1">
                  {a.createdAt && (
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(a.createdAt, {
                        addSuffix: true,
                      })}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-muted-foreground">
            No recent activities found
          </p>
        ),
    },
    {
      label: "Leaderboard",
      icon: Trophy,
      content: <LeaderboardPreview />,
    },
    {
      label: "Recent Badges",
      icon: Award,
      subtitle: "Your earned badges",
      containerClassName: "sm:col-span-2",
      content:
        userBadges.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-4">
            {userBadges.slice(0, 3).map((b) => (
              <Card key={b._id} className="gap-4 py-4 shadow-none">
                <CardContent className="px-4">
                  <div className="flex flex-col items-center gap-2">
                    <Image
                      src={b.badgeType.iconUrl || ""}
                      alt={b.badgeType.name}
                      width={48}
                      height={48}
                      className={cn(
                        "size-12 shrink-0 rounded-full border-2 object-cover",
                        {
                          "border-amber-700": b.level === "Bronze",
                          "border-gray-400": b.level === "Silver",
                          "border-yellow-400": b.level === "Gold",
                        },
                      )}
                    />
                    <p className="text-center text-pretty">
                      {b.badgeType.name}
                    </p>
                  </div>
                </CardContent>
                {b.level === "Gold" &&
                b.progress &&
                b.progress >= 100 ? null : (
                  <CardFooter className="block border-t px-4 !pt-4">
                    <Progress value={b.progress} />
                    <p className="mt-2 text-xs">
                      <span className="text-muted-foreground">
                        Progress to Next Level:
                      </span>{" "}
                      <strong>{b.progress}%</strong>
                    </p>
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No badges earned yet</p>
        ),
    },
    {
      label: "Community",
      icon: Handshake,
      subtitle: "Connect with friends, join groups, and collaborate.",
      link: "/community",
    },
    {
      label: "Blog",
      icon: FileText,
      subtitle: "Read the latest articles and insights.",
      link: "/blog",
    },
    {
      label: "Books",
      icon: BookOpenText,
      subtitle: "Explore recommended reads.",
      link: "/books",
    },
  ]

  return (
    <div>
      {/* Header */}
      <header className="mb-10">
        <h1 className="text-3xl font-bold">
          Welcome back{userName ? `, ${userName}` : ""}!
        </h1>
      </header>
      {/* Goals Full-Width Card */}
      <div className="mb-8">
        <Link href={goalsCard.link} aria-label="View goals and streak">
          <MotionCard whileHover={{ scale: 1.02 }}>
            <CardHeader className="text-center">
              <CardTitle
                className={`
                  flex items-center justify-center gap-4 text-2xl font-semibold
                  sm:text-3xl
                `}
              >
                <goalsCard.icon size={36} className="text-primary" />{" "}
                {goalsCard.label}
              </CardTitle>
              <CardDescription className="text-lg">
                {goalsCard.subtitle}
              </CardDescription>
            </CardHeader>
            <CardContent>{goalsCard.content}</CardContent>
          </MotionCard>
        </Link>
      </div>

      {/* Main Tiles Grid */}
      <div
        className={`
          mb-6 grid grid-flow-dense grid-cols-1 gap-6
          sm:grid-cols-2
          lg:grid-cols-3
        `}
      >
        {otherCards.map((c) => {
          const cardContent = (
            <MotionCard whileHover={{ scale: 1.02 }} className="h-full">
              <CardHeader className="text-center">
                <CardTitle
                  className={`
                    flex items-center justify-center gap-4 text-2xl
                    font-semibold
                    sm:text-3xl
                  `}
                >
                  <c.icon size={36} className="text-primary" /> {c.label}
                </CardTitle>
                <CardDescription className="text-lg">
                  {c.subtitle}
                </CardDescription>
              </CardHeader>
              {c.content && (
                <CardContent className="mt-auto">{c.content}</CardContent>
              )}
            </MotionCard>
          )

          if (c.link) {
            return (
              <Link
                href={c.link}
                aria-label={`View ${c.label.toLowerCase()}`}
                key={c.label}
                className={cn("block", c.containerClassName)}
              >
                {cardContent}
              </Link>
            )
          }

          return (
            <div key={c.label} className={c.containerClassName}>
              {cardContent}
            </div>
          )
        })}
      </div>
    </div>
  )
}
