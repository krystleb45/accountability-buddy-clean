import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import LeaderboardPreview from '../../components/Gamification/LeaderboardPreview';

describe('LeaderboardPreview', () => {
  it('renders without crashing', () => {
    render(<LeaderboardPreview />);
  });
});
