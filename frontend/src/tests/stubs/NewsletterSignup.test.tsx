import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import NewsletterSignup from '../../components/Forms/NewsletterSignup';

describe('NewsletterSignup', () => {
  it('renders without crashing', () => {
    render(
      <NewsletterSignup
        onSubmit={function (_data: { email: string; consent: boolean }): void {
          throw new Error('Function not implemented.');
        }}
      />,
    );
  });
});
