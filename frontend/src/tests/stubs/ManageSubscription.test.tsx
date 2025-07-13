import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import ManageSubscription from '../../components/Stripe/ManageSubscription';

describe('ManageSubscription', () => {
  it('renders without crashing', () => {
    render(<ManageSubscription />);
  });
});
