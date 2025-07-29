'use client';

import React from 'react';
import Card, { CardContent } from '@/components/cards/Card';
import styles from './StreakTracker.module.css';

export interface StreakTrackerProps {
  currentStreak: number; // Days in current streak
  longestStreak: number; // Days in longest streak
  goalProgress: number; // Percentage toward next milestone (0-100)
}

const StreakTracker: React.FC<StreakTrackerProps> = ({
  currentStreak,
  longestStreak,
  goalProgress,
}) => {
  const clampedProgress = Math.min(Math.max(goalProgress, 0), 100);

  return (
    <Card className={styles.card ?? ''} elevated bordered>
      <CardContent className={styles.content ?? ''}>
        <h3 className={styles.title}>🔥 Goal Streak</h3>
        <div className={styles.counts}>
          <p className={styles.count}>
            🔥 <span className={styles.label}>Current Streak:</span>{' '}
            <strong>
              {currentStreak} Day{currentStreak !== 1 ? 's' : ''}
            </strong>
          </p>
          <p className={styles.count}>
            🏆 <span className={styles.label}>Longest Streak:</span>{' '}
            <strong>
              {longestStreak} Day{longestStreak !== 1 ? 's' : ''}
            </strong>
          </p>
        </div>
        <div className={styles.progressWrapper}>
          <div
            className={styles.progressBar}
            style={{ width: `${clampedProgress}%` }}
            role="progressbar"
            aria-valuenow={clampedProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${clampedProgress}% to next milestone`}
          />
        </div>
        <p className={styles.progressText}>{clampedProgress}% to next milestone</p>
      </CardContent>
    </Card>
  );
};

export default StreakTracker;
