// src/tests/setupTests.tsx

// 1) Add all of jest-dom’s custom matchers (including toBeInTheDocument, etc)
import '@testing-library/jest-dom';
import React from 'react';

// 2) Polyfill ResizeObserver (for things like Recharts)
declare global {
  interface Window {
    ResizeObserver: new () => {
      observe(): void;
      unobserve(): void;
      disconnect(): void;
    };
    matchMedia: (query: string) => MediaQueryList;
  }
}
window.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as any;

// 2b) Polyfill scrolling on HTMLElement so ChatWindow/ChatBox tests don’t fail
Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
  configurable: true,
  value: () => { /* no-op */ },
});
Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
  configurable: true,
  value: () => { /* no-op */ },
});

// 2c) Polyfill window.matchMedia for ThemeContext
Object.defineProperty(window, 'matchMedia', {
  configurable: true,
  writable: true,
  value: (query: string) => ({
    media: query,
    matches: false,
    onchange: null,
    addListener: () => {},        // deprecated, but some libs still call it
    removeListener: () => {},     // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// 3) Mock next-auth/react by default
jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: null, status: 'unauthenticated' }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
  // stub out signOut so TS/jest both know it exists
  signOut: jest.fn(async (_opts: { redirect: boolean }) => {
    /* no-op */
  }),
}));

// 4) Silence React “act” warnings on your stubbed onClick throws
const originalConsoleError = console.error;
jest.spyOn(console, 'error').mockImplementation((...args: any[]) => {
  if (/Warning.*not wrapped in act/.test(args[0])) {
    return;
  }
  originalConsoleError(...args);
});
