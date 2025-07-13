import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import RewardsSection from '../../components/Dashboard/RewardsSection';

describe('RewardsSection', () => {
  it('renders without crashing', () => {
    render(<RewardsSection />);
  });
});
