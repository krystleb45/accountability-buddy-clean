import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import Leaderboard from '../../components/Gamification/Leaderboard';

describe('Leaderboard', () => {
  it('renders without crashing', () => {
    render(<Leaderboard userId={''} />);
  });
});
