import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import StreakCalendar from '../../components/Gamification/StreakCalendar';

describe('StreakCalendar', () => {
  it('renders without crashing', () => {
    render(<StreakCalendar completionDates={[]} />);
  });
});
