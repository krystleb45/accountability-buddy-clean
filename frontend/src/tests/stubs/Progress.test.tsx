import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import Progress from '../../components/Progress/Progress';

describe('Progress', () => {
  it('renders without crashing', () => {
    render(<Progress value={0} />);
  });
});
