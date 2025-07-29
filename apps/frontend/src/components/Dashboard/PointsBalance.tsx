'use client';

import React from 'react';

export interface PointsBalanceProps {
  /** Total points to display (optional, defaults to 0) */
  points?: number;
  /** Optional user level displayed beneath the points */
  level?: number;
}

/**
 * PointsBalance component shows the user's current points and optional level.
 */
const PointsBalance: React.FC<PointsBalanceProps> = ({ points = 0, level }) => (
  <aside
    className="rounded-lg bg-gray-900 p-4 text-center shadow-md"
    aria-label="Points balance"
  >
    <h3 className="mb-2 text-lg font-semibold text-white">🏅 Points Balance</h3>
    <p className="text-2xl font-bold text-green-400">
      {(points ?? 0).toLocaleString()} pts
    </p>
    {level != null && (
      <p className="text-sm text-gray-400">
        Level <strong className="text-white">{level}</strong>
      </p>
    )}
  </aside>
);

export default PointsBalance;
