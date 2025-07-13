// src/tests/stubs/LayoutClient.test.tsx

// 1) Mock Next.js navigation *before* any React imports
jest.mock('next/navigation', () => ({
  usePathname: () => '/',      // always “home”
  useRouter: () => ({          // stub out the whole router API
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
    beforePopState: jest.fn(),
    events: { on: jest.fn(), off: jest.fn(), emit: jest.fn() },
    isFallback: false,
    isReady: true,
  }),
}));

// 2) Stub out all of LayoutClient’s children
jest.mock('react-hot-toast',       () => ({ Toaster: () => <div data-testid="toaster" /> }));
jest.mock('../../components/AuthTokenSync', () => () => <div data-testid="auth-sync" />);
jest.mock('@/components/Navbar/Navbar',     () => () => <div data-testid="navbar" />);
// (we no longer mock Quotes, but since ssr:false dynamic won’t show up, we skip it)

// 3) Now import React, RTL, and the component under test
import React from 'react';
import { render } from '@testing-library/react';

// NB: we deliberately avoid any jest-dom matchers here
import LayoutClient from '../../components/LayoutClient';

describe('LayoutClient', () => {
  it('mounts and renders its layout parts plus children', () => {
    const { getByTestId, getByText } = render(
      <LayoutClient>
        <div data-testid="child">Hello world</div>
      </LayoutClient>
    );

    // these will throw if missing:
    getByTestId('auth-sync');
    getByTestId('toaster');
    getByTestId('navbar');

    // because usePathname() → '/', we should see the hero
    getByText('Military Support');

    // our child
    getByTestId('child');

    // and the footer text
    getByText(/Accountability Buddy/);
  });
});
