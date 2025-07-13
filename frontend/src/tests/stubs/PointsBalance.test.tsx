import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import PointsBalance from '../../components/Dashboard/PointsBalance';

describe('PointsBalance', () => {
  it('renders without crashing', () => {
    render(<PointsBalance points={0} />);
  });
});
