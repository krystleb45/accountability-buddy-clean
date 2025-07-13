import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import AchievementCard from '../../components/Progress/AchievementCard';

describe('AchievementCard', () => {
  it('renders without crashing', () => {
    render(<AchievementCard id={''} title={''} description={''} progress={0} isUnlocked={false} />);
  });
});
