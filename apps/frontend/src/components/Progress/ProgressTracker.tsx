// components/Progress/ProgressTracker.tsx
"use client"

import React from "react"

import styles from "./ProgressTracker.module.css"

interface ProgressTrackerProps {
  /** 0–100 */
  progress: number
  /** Label to announce for screen readers */
  label?: string
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  progress,
  label = "Progress",
}) => {
  // Clamp to [0,100]
  const validProgress = Math.max(0, Math.min(progress, 100))

  return (
    <div
      className={styles.container}
      role="region"
      aria-labelledby="progress-tracker-label"
    >
      <div
        className={styles.barContainer}
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={validProgress}
        tabIndex={0} // keyboard focusable so screen‐reader users can inspect it
      >
        <div
          className={styles.bar}
          style={{ width: `${validProgress}%` }}
          aria-hidden="true"
        />
      </div>
      <span
        id="progress-tracker-label"
        className={styles.label}
        aria-live="polite"
      >
        {label}: {validProgress}% Complete
      </span>
    </div>
  )
}

export default ProgressTracker
