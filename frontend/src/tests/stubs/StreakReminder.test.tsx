// src/tests/stubs/StreakReminder.test.tsx
import React from 'react';
import { render } from '@testing-library/react';

// 1) Stub next/image so Jest can render it
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

// 2) Stub next/navigation (your component only reads the path, but doesn’t care what it is here)
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

// 3) Stub the BellRing icon from lucide-react
jest.mock('lucide-react', () => ({
  __esModule: true,
  BellRing: (props: any) => <span data-testid="bell-ring" {...props} />,
}));

// 4) Stub framer-motion’s `motion.div` so it just renders a normal <div>
jest.mock('framer-motion', () => ({
  __esModule: true,
  motion: {
    div: (props: any) => <div {...props} />,
  },
}));

// 5) Now import your component under test
import StreakReminder from '../../components/Profile/StreakReminder';

describe('StreakReminder', () => {
  it('renders without crashing when a reminder should show', () => {
    // omit lastGoalCompletedAt so showReminder===true
    render(<StreakReminder currentStreak={3} />);
  });

  it('renders nothing (null) when the streak is maintained', () => {
    // pass today’s date → lastGoalCompletedAt equals today → showReminder=false
    const today = new Date().toISOString();
    const { container } = render(
      <StreakReminder lastGoalCompletedAt={today} currentStreak={5} />
    );

    // manual assertion instead of `.toBeNull()`
    if (container.firstChild !== null) {
      throw new Error(
        `Expected StreakReminder to render nothing when the streak is maintained, but found ${container.firstChild}`
      );
    }
  });
});
