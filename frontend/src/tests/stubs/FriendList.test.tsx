// src/tests/stubs/FriendList.test.tsx
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

// 1) Mock the Next.js App Router hook so useRouter() returns a safe stub
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    // add any other router methods your component might call
  }),
}));

// 2) next-auth/session is already mocked in setupTests.tsx, so you’ll get an unauthenticated session by default
import FriendList from '../../components/Friend/FriendList';

describe('FriendList', () => {
  it('renders without crashing', () => {
    render(<FriendList />);
  });
});
