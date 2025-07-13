import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import ErrorBoundary from '../../components/Activities/ErrorBoundary';

describe('ErrorBoundary', () => {
  it('renders without crashing', () => {
    // Provide a simple child node inside the boundary
    render(
      <ErrorBoundary>
        <div>Test child</div>
      </ErrorBoundary>,
    );
  });
});
