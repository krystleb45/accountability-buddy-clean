// src/tests/stubs/Navbar.test.tsx

import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

// 1) Mock out next/navigation so useRouter() and usePathname() won’t blow up
jest.mock('next/navigation', () => ({
  usePathname: () => '/',              // pretend we’re always on “/”
  useRouter: () => ({                   // a minimal router stub
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
    refresh: jest.fn(),
  }),
}));

// 2) Now import the component under test
import Navbar from '../../components/Navbar/Navbar';

describe('Navbar', () => {
  it('renders without crashing', () => {
    render(<Navbar />);
  });
});
