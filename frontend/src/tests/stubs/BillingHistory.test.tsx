import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import BillingHistory from '../../components/Stripe/BillingHistory';

describe('BillingHistory', () => {
  it('renders without crashing', () => {
    render(<BillingHistory />);
  });
});
