import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import RecentActivities from '../../components/Activities/RecentActivities';

describe('RecentActivities', () => {
  it('renders without crashing', () => {
    render(<RecentActivities userId={''} />);
  });
});
