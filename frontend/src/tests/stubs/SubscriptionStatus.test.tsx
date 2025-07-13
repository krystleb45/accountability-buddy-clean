// src/tests/stubs/SubscriptionStatus.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';

// 1) Before importing your component, mock out the service:
jest.mock('../../services/subscriptionService', () => ({
  getRealTimeStatus: jest.fn(),
}));

// 2) Now import the mocked service and the component under test:
import SubscriptionService from '../../services/subscriptionService';
import SubscriptionStatus from '../../components/Subscriptions/SubscriptionStatus';

describe('SubscriptionStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (SubscriptionService.getRealTimeStatus as jest.Mock).mockResolvedValue({
      status: 'Active 🟢',
    });
  });

  it('shows loading, then the fetched status, and renders a Refresh button', async () => {
    render(<SubscriptionStatus />);

    // 3) Immediately after render, your component now shows:
    //    "Loading your subscription status..."
    screen.getByText(/Loading your subscription status\.\.\./i);

    // 4) After the promise resolves, the "Active 🟢" text must appear
    await screen.findByText('Active 🟢');

    // 5) The Refresh button must also be in the tree
    screen.getByRole('button', { name: /Refresh Status/ });
  });
});
