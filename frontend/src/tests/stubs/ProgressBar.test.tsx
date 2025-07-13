import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import ProgressBar from '../../components/Progress/ProgressBar';

describe('ProgressBar', () => {
  it('renders without crashing', () => {
    render(<ProgressBar value={0} max={0} />);
  });
});
