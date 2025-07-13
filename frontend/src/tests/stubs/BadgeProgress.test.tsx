import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import BadgeProgress from '../../components/BadgeSystem/BadgeProgress';

describe('BadgeProgress', () => {
  it('renders without crashing', () => {
    render(<BadgeProgress badgeName={''} progress={0} criteria={''} />);
  });
});
