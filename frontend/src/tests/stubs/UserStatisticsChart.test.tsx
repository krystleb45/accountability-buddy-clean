import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import UserStatisticsChart from '../../components/charts/UserStatisticsChart';

describe('UserStatisticsChart', () => {
  it('renders without crashing', () => {
    render(
      <UserStatisticsChart
        totalGoals={0}
        completedGoals={0}
        collaborations={0}
        goalTrends={[]}
        categoryBreakdown={[]}
        currentStreak={0}
        longestStreak={0}
      />,
    );
  });
});
