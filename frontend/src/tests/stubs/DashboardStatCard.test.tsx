import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import DashboardStatCard from '../../components/Dashboard/DashboardStatCard';

describe('DashboardStatCard', () => {
  it('renders without crashing', () => {
    render(<DashboardStatCard title={''} value={''} />);
  });
});
