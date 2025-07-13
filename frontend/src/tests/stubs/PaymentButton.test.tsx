import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import PaymentButton from '../../components/Buttons/PaymentButton';

describe('PaymentButton', () => {
  it('renders without crashing', () => {
    render(<PaymentButton buttonText={''} priceId={''} />);
  });
});
