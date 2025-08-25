// src/components/BadgeSystem/BadgeProgress.tsx
"use client"

import type { FC } from "react"

import React from "react"

import "./BadgeProgress.css"

export interface BadgeProgressProps {
  badgeName: string
  /** Progress percentage (0–100) */
  progress: number
  /** Description of what’s required to earn this badge */
  criteria: string
}

const BadgeProgress: FC<BadgeProgressProps> = ({
  badgeName,
  progress,
  criteria,
}) => {
  // Clamp progress to [0,100]
  const pct = Math.max(0, Math.min(100, progress))

  return (
    <div role="region" aria-labelledby="badge-progress-title">
      <h3 id="badge-progress-title">{badgeName}</h3>
      <p>{criteria}</p>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label={`${pct}% progress toward earning the ${badgeName} badge`}
      >
        <div style={{ width: `${pct}%` }} />
      </div>
      <p>{pct}% Complete</p>
    </div>
  )
}

export default BadgeProgress
