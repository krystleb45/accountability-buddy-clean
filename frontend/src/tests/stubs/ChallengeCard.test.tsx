// src/tests/stubs/ChallengeCard.test.tsx

import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import ChallengeCard, { ChallengeCardProps } from '../../components/Challenges/ChallengeCard';

describe('ChallengeCard', () => {
  it('renders without crashing', () => {
    type ChallengeType = ChallengeCardProps['challenge'];

    const dummyChallenge = {
      id: 'abc',
      title: 'Test Challenge',
      description: 'Just a stub',
      participants: [], // ← must exist
      creator: { _id: 'test-user' }, // ← must exist
      visibility: 'public', // ← so it doesn’t early-return null
      // …any other fields the real component destructures…
    } as unknown as ChallengeType;

    render(<ChallengeCard challenge={dummyChallenge} userId="test-user" />);
  });
});
