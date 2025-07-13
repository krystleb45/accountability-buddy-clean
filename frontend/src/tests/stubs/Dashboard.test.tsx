import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import Dashboard, { DashboardProps } from '../../components/Dashboard/Dashboard';

describe('Dashboard', () => {
  it('renders without crashing', () => {
    // Extract the exact UserProgress type from the props
    type UserProgressType = DashboardProps['userProgress'];
    // Cast an empty object to that type to satisfy TS without knowing its fields
    const dummyUserProgress = {} as UserProgressType;

    render(
      <Dashboard
        userName=""
        userStats={{
          totalGoals: 0,
          completedGoals: 0,
          collaborations: 0,
        }}
        recentActivities={[]}
        userProgress={dummyUserProgress} // use the dummy cast
        recentBadges={[]}
        points={0}
        streakData={{
          currentStreak: 0,
          goalProgress: 0,
        }}
      />,
    );
  });
});
