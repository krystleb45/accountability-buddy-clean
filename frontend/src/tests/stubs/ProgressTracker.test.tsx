import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import ProgressTracker from '../../components/Progress/ProgressTracker';

describe('ProgressTracker', () => {
  it('renders without crashing', () => {
    render(<ProgressTracker progress={0} />);
  });
});
