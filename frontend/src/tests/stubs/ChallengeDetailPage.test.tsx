// src/tests/stubs/ChallengeDetailPage.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';

// 0) Mock useParams so `id` is never null
jest.mock('next/navigation', () => ({
  useParams: () => ({ id: 'test-challenge-id' }),
}));

// 1) Stub out your Skeleton
jest.mock('@/components/UtilityComponents/SkeletonComponent', () => ({
  __esModule: true,
  Skeleton: () => <div data-testid="skeleton-stub" />,
}));

// 2) Now import your page under test
import ChallengeDetailPage from '../../components/Challenges/ChallengeDetailPage';

describe('ChallengeDetailPage', () => {
  it('renders without crashing and shows loading skeletons', () => {
    render(<ChallengeDetailPage />);

    // getAllByTestId will throw if it finds zero, otherwise returns an array
    const skeletons = screen.getAllByTestId('skeleton-stub');

    // simple JS assertion instead of expect().toHaveLength / greaterThan
    if (skeletons.length === 0) {
      throw new Error('Expected at least one <Skeleton> but found none');
    }
  });
});
