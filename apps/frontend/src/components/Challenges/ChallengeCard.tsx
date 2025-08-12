// src/components/Challenges/ChallengeCard.tsx
"use client"

import { format } from "date-fns"
import { motion } from "motion/react"
import React from "react"

import type { Challenge } from "@/api/challenge/challengeApi"

import "./ChallengeCard.css"

export interface ChallengeCardProps {
  challenge: Challenge
  isJoined?: boolean
  onJoin?: (challengeId: string) => void
  onLeave?: (challengeId: string) => void
  userProgress?: number
  userId: string
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  isJoined = false,
  onJoin,
  onLeave,
  userProgress,
  userId,
}) => {
  const {
    _id,
    title,
    description,
    goal,
    startDate,
    endDate,
    status,
    creator,
    participantCount,
    visibility,
    participants,
  } = challenge

  const isParticipant = participants.some((p) => p.user === userId)
  const isCreator = creator._id === userId
  if (visibility !== "public" && !isParticipant && !isCreator) return null

  const handleJoin = () => onJoin?.(_id)
  const handleLeave = () => onLeave?.(_id)

  // Determine the status badge styling
  const statusClass =
    status === "completed"
      ? "bg-green-500 text-black"
      : status === "ongoing"
        ? "bg-yellow-500 text-black"
        : "bg-red-500 text-black"

  return (
    <motion.div
      className="challenge-card relative flex flex-col rounded-lg bg-gray-800 p-4 shadow-md sm:flex-row sm:space-x-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      role="group"
      aria-labelledby={`challenge-title-${_id}`}
    >
      {isJoined && (
        <span
          className="absolute right-2 top-2 rounded-full bg-green-500 px-2 py-1 text-xs text-white shadow-md"
          aria-label="Joined"
        >
          ✅ Joined
        </span>
      )}

      {/* Creator & status */}
      <div className="mb-4 flex flex-col sm:mb-0 sm:flex-row sm:items-center sm:space-x-4">
        <div className="creator-info mb-2 flex items-center gap-3 sm:mb-0">
          <img
            src={creator.profilePicture || "/default-avatar.png"}
            alt={`${creator.username}'s avatar`}
            className="creator-avatar size-8 rounded-full"
          />
          <span className="creator-name text-sm text-white sm:text-base">
            @{creator.username}
          </span>
        </div>
        <span
          className={`status-badge rounded-full px-2 py-1 text-xs sm:text-sm ${statusClass}`}
          aria-label={`Status: ${status}`}
        >
          {status}
        </span>
      </div>

      {/* Main content */}
      <div className="flex-1">
        <h3
          id={`challenge-title-${_id}`}
          className="challenge-title mb-2 text-lg font-bold text-white sm:text-xl"
        >
          {title}
        </h3>
        <p className="challenge-description mb-2 text-sm text-gray-300 sm:text-base">
          {description || "No description provided."}
        </p>
        <p className="challenge-goal mb-2 text-sm text-gray-400 sm:text-base">
          🎯 Goal: {goal}
        </p>

        {/* Progress bar if joined */}
        {isJoined && typeof userProgress === "number" && (
          <div className="my-3">
            <p className="mb-1 text-sm text-gray-300 sm:text-base">
              Progress: {Math.min(userProgress, 100)}%
            </p>
            <div className="h-2 w-full rounded bg-gray-700">
              <div
                className="h-2 rounded bg-green-400"
                style={{ width: `${Math.min(userProgress, 100)}%` }}
                role="progressbar"
                aria-valuenow={Math.min(userProgress, 100)}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
        )}

        {/* Dates & participants */}
        {startDate && endDate && (
          <div className="challenge-footer text-sm text-gray-400 sm:text-base">
            <p>
              🗓 {format(new Date(startDate), "MMM d, yyyy")} –{" "}
              {format(new Date(endDate), "MMM d, yyyy")}
            </p>
            <p>👥 {participantCount ?? participants.length} Participants</p>
          </div>
        )}
      </div>

      {/* Join/Leave buttons if ongoing */}
      {status === "ongoing" && (
        <div className="challenge-actions mt-4 flex flex-col gap-3 sm:mt-0 sm:flex-row sm:gap-6">
          {isJoined ? (
            <button
              type="button"
              className="leave-btn w-full rounded-md bg-red-600 py-2 text-white sm:w-auto"
              onClick={handleLeave}
            >
              Leave Challenge
            </button>
          ) : (
            <button
              type="button"
              className="join-btn w-full rounded-md bg-green-600 py-2 text-white sm:w-auto"
              onClick={handleJoin}
            >
              Join Challenge
            </button>
          )}
        </div>
      )}
    </motion.div>
  )
}

export default ChallengeCard
