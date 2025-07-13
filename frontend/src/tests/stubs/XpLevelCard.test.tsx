import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import XpLevelCard from '../../components/Gamification/XpLevelCard';

describe('XpLevelCard', () => {
  it('renders without crashing', () => {
    render(<XpLevelCard level={0} points={0} pointsToNextLevel={0} progressToNextLevel={0} />);
  });
});
