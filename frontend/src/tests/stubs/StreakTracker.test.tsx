import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import StreakTracker from '../../components/Gamification/StreakTracker';

describe('StreakTracker', () => {
  it('renders without crashing', () => {
    render(<StreakTracker currentStreak={0} longestStreak={0} goalProgress={0} />);
  });
});
