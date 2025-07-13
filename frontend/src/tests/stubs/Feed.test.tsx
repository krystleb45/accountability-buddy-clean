import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import Feed from '../../components/Activities/Feed';

describe('Feed', () => {
  it('renders without crashing', () => {
    render(<Feed />);
  });
});
