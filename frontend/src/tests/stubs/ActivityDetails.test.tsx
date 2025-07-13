// src/tests/stubs/ActivityDetails.test.tsx

import React from 'react';
import { render, screen } from '@testing-library/react';

// 1) Mock next/navigation *before* importing the page component
jest.mock('next/navigation', () => ({
  // stub out useParams to always return an object with an `id`
  useParams: () => ({ id: 'test-activity-id' }),
}));

// 2) Now import your component under test
import ActivityDetails from '../../components/Activities/ActivityDetails';

describe('ActivityDetails', () => {
  it('renders without crashing (and shows a loading state)', () => {
    render(<ActivityDetails />);

    // `getByText` throws if it can’t find the element, so this asserts “loading” is present:
    screen.getByText(/loading/i);
  });
});
