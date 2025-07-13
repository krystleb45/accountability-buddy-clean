// src/components/BadgeSystem/BadgeProgress.tsx
'use client';

import React, { FC } from 'react';
import './BadgeProgress.css';

export interface BadgeProgressProps {
  badgeName: string;
  /** Progress percentage (0–100) */
  progress: number;
  /** Description of what’s required to earn this badge */
  criteria: string;
}

const BadgeProgress: FC<BadgeProgressProps> = ({ badgeName, progress, criteria }) => {
  // Clamp progress to [0,100]
  const pct = Math.max(0, Math.min(100, progress));

  return (
    <div className="badge-progress" role="region" aria-labelledby="badge-progress-title">
      <h3 id="badge-progress-title" className="badge-progress-title">
        {badgeName}
      </h3>
      <p className="badge-progress-criteria">{criteria}</p>
      <div
        className="progress-bar-container"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label={`${pct}% progress toward earning the ${badgeName} badge`}
      >
        <div className="progress-bar" style={{ width: `${pct}%` }} />
      </div>
      <p className="progress-percentage">{pct}% Complete</p>
    </div>
  );
};

export default BadgeProgress;
