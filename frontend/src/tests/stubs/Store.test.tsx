import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import Store from '../../components/PointShop/Store';

describe('Store', () => {
  it('renders without crashing', () => {
    render(<Store />);
  });
});
