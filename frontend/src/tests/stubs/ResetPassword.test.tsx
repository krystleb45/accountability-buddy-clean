// src/tests/stubs/ResetPassword.test.tsx
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

// 1) Mock next/router BEFORE importing your component
jest.mock('next/router', () => ({
  useRouter: () => ({
    // give it whatever shape your component expects
    query: { token: 'fake-token' },
    push: jest.fn(),
  }),
}));

// 2) Now import the component under test
import ResetPassword from '../../components/Forms/ResetPassword';

describe('ResetPassword', () => {
  it('renders without crashing', () => {
    render(<ResetPassword />);
    // Optionally assert something in your form, e.g. the submit button:
    // expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
  });
});
