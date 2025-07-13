// src/tests/stubs/LeaderboardCard.test.tsx
import React from 'react';
import { render } from '@testing-library/react';

// 1) Mock next/image to a plain <img>
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

// 2) Mock lucide-react icons so they’re never undefined
jest.mock('lucide-react', () => ({
  Trophy: () => <svg data-testid="icon-trophy" />,
  Medal: () => <svg data-testid="icon-medal" />,
  User: () => <svg data-testid="icon-user" />,
}));

// 3) Default‐import your component
import LeaderboardCard from '../../components/Gamification/LeaderboardCard';

type Props    = React.ComponentProps<typeof LeaderboardCard>;
type UserType = Props['user'];

describe('LeaderboardCard', () => {
  it('renders without crashing', () => {
    const dummyUser = {} as UserType;
    render(<LeaderboardCard user={dummyUser} index={0} />);
  });
});
