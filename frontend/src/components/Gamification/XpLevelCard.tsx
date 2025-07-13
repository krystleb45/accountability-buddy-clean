'use client';

import React from 'react';
import styles from './XpLevelCard.module.css';

export interface XpLevelCardProps {
  level: number;
  points: number;
  pointsToNextLevel: number;
  progressToNextLevel: number; // Percentage (0-100)
}

const XpLevelCard: React.FC<XpLevelCardProps> = ({
  level,
  points,
  pointsToNextLevel,
  progressToNextLevel,
}) => {
  const clampedProgress = Math.min(Math.max(progressToNextLevel, 0), 100);

  return (
    <div className={styles.card}>
      <h2 className={styles.heading}>🔥 Level {level}</h2>

      <div
        className={styles.progressBarContainer}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clampedProgress}
        aria-label={`${clampedProgress}% to next level`}
      >
        <div className={styles.progressBarFill} style={{ width: `${clampedProgress}%` }} />
      </div>

      <div className={styles.stats}>
        <span className={styles.points}>{points} XP</span>
        <span className={styles.nextLevel}>{pointsToNextLevel} XP to next</span>
      </div>
    </div>
  );
};

export default XpLevelCard;
