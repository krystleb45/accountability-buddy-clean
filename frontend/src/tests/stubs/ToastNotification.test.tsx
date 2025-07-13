// src/tests/stubs/ToastNotification.test.tsx

import React from 'react';
import { render } from '@testing-library/react';

// 1) mock out react-toastify BEFORE importing the component
jest.mock('react-toastify', () => ({
  toast: jest.fn(),
  ToastContainer: () => <div data-testid="toast-container" />,
}));

// 2) import the component under test
import { ToastNotificationContainer } from '../../components/Toasts/ToastNotification';

describe('ToastNotificationContainer', () => {
  it('renders without crashing', () => {
    const { getByTestId } = render(<ToastNotificationContainer />);
    // getByTestId will throw if it doesn't find the element,
    // so this alone will fail the test on missing output.
    getByTestId('toast-container');
  });
});
