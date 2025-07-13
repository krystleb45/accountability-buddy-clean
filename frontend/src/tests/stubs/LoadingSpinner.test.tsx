import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders without crashing', () => {
    render(<LoadingSpinner />);
  });
});
