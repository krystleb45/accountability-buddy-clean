import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import StripeCheckout from '../../components/Stripe/StripeCheckout';

describe('StripeCheckout', () => {
  it('renders without crashing', () => {
    render(
      <StripeCheckout
        clientSecret={''}
        onSuccess={function (): void {
          throw new Error('Function not implemented.');
        }}
        onError={function (_error: string): void {
          throw new Error('Function not implemented.');
        }}
      />,
    );
  });
});
