// src/components/Dashboard/Dashboard.tsx
"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { useRouter } from "next/navigation"
import React from "react"

import type { Badge, UserProgress } from "@/types/Gamification.types"

import LeaderboardPreview from "@/components/Gamification/LeaderboardPreview"

import styles from "./Dashboard.module.css"
import PointsBalance from "./PointsBalance"

interface Card {
  label: string
  emoji: string
  subtitle: string
  onClick: () => void
  content: React.ReactNode
}

export interface DashboardProps {
  userName: string
  userStats: {
    totalGoals: number
    completedGoals: number
    collaborations: number
  }
  recentActivities: string[]
  userProgress: UserProgress
  recentBadges: Badge[]
  points: number
  streakData: {
    currentStreak: number
    goalProgress: number
  }
  onAction?: (action: string) => void
}

const Dashboard: React.FC<DashboardProps> = ({
  userName,
  userStats,
  recentActivities,
  userProgress,
  recentBadges,
  points,
  streakData,
  onAction = () => {},
}) => {
  const router = useRouter()
  const pct =
    typeof streakData.goalProgress === "number" ? streakData.goalProgress : 0

  // top‐level Goals card
  const goalsCard: Card = {
    label: "Goals",
    emoji: "🎯",
    subtitle: "Track your progress and explore suggested goals.",
    onClick: () => router.push("/goals"),
    content: (
      <>
        <p className="mt-2 text-lg font-bold text-yellow-400 sm:text-xl">
          🔥 {streakData.currentStreak}-Day Streak
        </p>
        <div className="mt-4 h-4 w-full rounded-lg bg-gray-700">
          <div
            className="h-full rounded-lg bg-green-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-1 text-sm text-gray-300 sm:text-base">
          {pct.toFixed(1)}% Completed
        </p>
      </>
    ),
  }

  // the other fixed cards
  const otherCards: Card[] = [
    {
      label: "Community",
      emoji: "🤝",
      subtitle: "Connect with friends, join groups, and collaborate.",
      onClick: () => router.push("/community"),
      content: (
        <div className="flex justify-center space-x-4">
          <span className="rounded bg-green-600 px-3 py-1 text-white">
            Friends
          </span>
          <span className="rounded bg-green-600 px-3 py-1 text-white">
            Groups
          </span>
        </div>
      ),
    },
    {
      label: "Your Stats",
      emoji: "📊",
      subtitle: "Stats Overview",
      onClick: () => router.push("/statistics"),
      content: (
        <>
          <p className="mt-2 text-lg font-bold text-yellow-400 sm:text-xl">
            Total Goals: {userStats.totalGoals}
          </p>
          <p className="mt-2 text-lg font-bold text-yellow-400 sm:text-xl">
            Completed Goals: {userStats.completedGoals}
          </p>
          <p className="mt-2 text-lg font-bold text-yellow-400 sm:text-xl">
            Collaborations: {userStats.collaborations}
          </p>
        </>
      ),
    },
  ]

  return (
    <div
      className={`${styles.dashboardContainer} rounded-lg bg-black p-6 text-white shadow-lg`}
    >
      {/* Header */}
      <header className="mb-6">
        <h1 className="mb-4 text-3xl font-bold">Welcome back, {userName}!</h1>
      </header>

      {/* Goals Full-Width Card */}
      <div className="mb-8">
        <motion.div
          role="button"
          aria-label="View goals and streak"
          whileHover={{ scale: 1.05 }}
          onTap={() => {
            onAction("goals")
            goalsCard.onClick()
          }}
          className="block w-full cursor-pointer rounded-lg bg-gray-900 p-6 text-center shadow-lg transition hover:shadow-xl"
        >
          <h2 className="text-2xl font-semibold text-kelly-green sm:text-3xl">
            {goalsCard.emoji} {goalsCard.label}
          </h2>
          <p className="text-gray-400">{goalsCard.subtitle}</p>
          {goalsCard.content}
        </motion.div>
      </div>

      {/* Main Tiles Grid */}
      <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {otherCards.map((c) => (
          <motion.div
            key={c.label}
            role="button"
            aria-label={`View ${c.label.toLowerCase()}`}
            whileHover={{ scale: 1.05 }}
            onTap={() => {
              onAction(c.label.toLowerCase())
              c.onClick()
            }}
            className="block size-full cursor-pointer rounded-lg bg-gray-900 p-6 text-center shadow-lg transition hover:shadow-xl"
          >
            <h2 className="text-2xl font-semibold text-kelly-green sm:text-3xl">
              {c.emoji} {c.label}
            </h2>
            <p className="mb-4 text-gray-400">{c.subtitle}</p>
            {c.content}
          </motion.div>
        ))}

        {/* Your Progress */}
        <motion.section
          whileHover={{ scale: 1.02 }}
          className="rounded-lg bg-gray-900 p-6 text-center shadow-lg transition hover:shadow-xl"
        >
          <h3 className="mb-2 text-xl font-bold text-white sm:text-2xl">
            🏆 Your Progress
          </h3>
          <p className="text-sm text-green-400 sm:text-base">
            XP: {userProgress.points}
          </p>
          <p className="text-sm text-blue-300 sm:text-base">
            Level: {userProgress.level}
          </p>
          <div className="mt-2 h-2 w-full rounded-full bg-gray-700">
            <div
              className="h-2 rounded-full bg-green-500"
              style={{ width: `${userProgress.progressToNextLevel ?? 0}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-gray-300 sm:text-sm">
            {userProgress.pointsToNextLevel ?? 0} XP to next level
          </p>
        </motion.section>

        {/* Points Balance */}
        <div className="sm:col-span-2 lg:col-span-1">
          <PointsBalance points={points} />
        </div>

        {/* Recent Activities */}
        <motion.section
          whileHover={{ scale: 1.02 }}
          className="rounded-lg bg-gray-900 p-4 shadow-lg transition hover:shadow-xl"
        >
          <h3 className="mb-2 text-xl font-bold text-white sm:text-2xl">
            📜 Recent Activities
          </h3>
          {recentActivities.length > 0 ? (
            <ul className="list-inside list-disc text-gray-200">
              {recentActivities.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-400">
              No recent activities found
            </p>
          )}
        </motion.section>

        {/* Blog */}
        <motion.div
          role="button"
          aria-label="Read the blog"
          whileHover={{ scale: 1.05 }}
          onTap={() => {
            onAction("blog")
            router.push("/blog")
          }}
          className="block size-full cursor-pointer rounded-lg bg-gray-900 p-6 text-center shadow-lg transition hover:shadow-xl"
        >
          <h2 className="text-2xl font-semibold text-kelly-green sm:text-3xl">
            📝 Blog
          </h2>
          <p className="text-gray-400">Read the latest posts and updates.</p>
        </motion.div>

        {/* Books */}
        <motion.div
          role="button"
          aria-label="View book recommendations"
          whileHover={{ scale: 1.05 }}
          onTap={() => {
            onAction("books")
            router.push("/books")
          }}
          className="block size-full cursor-pointer rounded-lg bg-gray-900 p-6 text-center shadow-lg transition hover:shadow-xl"
        >
          <h2 className="text-2xl font-semibold text-kelly-green sm:text-3xl">
            📚 Books
          </h2>
          <p className="text-gray-400">Explore recommended reads.</p>
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          role="button"
          aria-label="View full leaderboard"
          whileHover={{ scale: 1.02 }}
          onTap={() => {
            onAction("leaderboard")
            router.push("/leaderboard")
          }}
          className="block size-full cursor-pointer rounded-lg bg-gray-900 p-4 text-center shadow-lg transition hover:shadow-xl"
        >
          <h3 className="mb-2 text-xl font-bold text-white sm:text-2xl">
            🏆 Leaderboard
          </h3>
          <LeaderboardPreview
            sortBy="points"
            timeRange="weekly"
            title="Top Performers"
          />
        </motion.div>
      </div>

      {/* Recent Badges */}
      {recentBadges.length > 0 && (
        <div className="mb-6">
          <motion.section
            whileHover={{ scale: 1.02 }}
            className="rounded-lg bg-gray-900 p-4 text-center shadow-lg transition hover:shadow-xl"
          >
            <h3 className="mb-2 text-xl font-bold text-yellow-400 sm:text-2xl">
              🎖️ Recent Badges
            </h3>
            <div className="flex flex-wrap justify-center gap-4">
              {recentBadges.slice(0, 3).map((b) => (
                <div key={b.id} className="text-sm text-white">
                  <Image
                    src={b.imageUrl || "/placeholder-badge.png"}
                    alt={b.name}
                    width={48}
                    height={48}
                    className="mx-auto"
                  />
                  <p className="mt-1">{b.name}</p>
                </div>
              ))}
            </div>
          </motion.section>
        </div>
      )}
    </div>
  )
}

export default Dashboard
