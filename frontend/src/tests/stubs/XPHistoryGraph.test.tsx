import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import XPHistoryGraph from '../../components/Profile/XPHistoryGraph';

describe('XPHistoryGraph', () => {
  it('renders without crashing', () => {
    render(<XPHistoryGraph />);
  });
});
