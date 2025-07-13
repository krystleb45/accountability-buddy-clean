// src/tests/stubs/Register.test.tsx
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

// 1) Mock Next’s useRouter so it won’t throw “router not mounted”
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
    query: {},               // if your component reads router.query.token, etc.
  }),
}));

// 2) Stub out your custom useRegister hook (named export)
jest.mock('@/hooks/useRegister', () => ({
  __esModule: true,
  useRegister: () => ({
    loading: false,
    error: null,
    success: false,
    register: jest.fn(),
  }),
}));

// 3) Now import the component under test
import Register from '../../components/Forms/Register';

describe('Register', () => {
  it('renders without crashing', () => {
    render(<Register />);
  });
});
