// src/tests/stubs/SubscriptionActions.test.tsx
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

// 1) Import your APIProvider
import { APIProvider } from '../../context/data/APIContext';

// 2) Import the component under test
import SubscriptionActions from '../../components/Subscriptions/SubscriptionActions';

describe('SubscriptionActions', () => {
  it('renders without crashing', () => {
    render(
      <APIProvider>
        <SubscriptionActions />
      </APIProvider>
    );
  });
});
