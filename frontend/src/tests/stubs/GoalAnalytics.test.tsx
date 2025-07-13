import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import GoalAnalytics from '../../components/Goals/GoalAnalytics';

describe('GoalAnalytics', () => {
  it('renders without crashing', () => {
    render(<GoalAnalytics />);
  });
});
