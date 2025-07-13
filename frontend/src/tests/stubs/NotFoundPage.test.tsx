// src/tests/stubs/NotFoundPage.test.tsx
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

import NotFoundPage from '../../components/Notifications/NotFoundPage';

describe('NotFoundPage', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    );

    // Optional smoke assertions:
    // expect(screen.getByText(/page not found/i)).toBeInTheDocument();
  });
});
