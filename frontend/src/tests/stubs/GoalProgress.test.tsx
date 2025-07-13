import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import GoalProgress from '../../components/Gamification/GoalProgress';

describe('GoalProgress', () => {
  it('renders without crashing', () => {
    render(
      <GoalProgress
        goalTitle={''}
        currentProgress={0}
        targetProgress={0}
        onEditGoal={function (): void {
          throw new Error('Function not implemented.');
        }}
      />,
    );
  });
});
