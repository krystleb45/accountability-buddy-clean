import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import PointShop from '../../components/PointShop/PointShop';

describe('PointShop', () => {
  it('renders without crashing', () => {
    render(<PointShop />);
  });
});
