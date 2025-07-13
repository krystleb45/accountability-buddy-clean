import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import ForgotPassword from '../../components/Forms/ForgotPassword';

describe('ForgotPassword', () => {
  it('renders without crashing', () => {
    render(<ForgotPassword />);
  });
});
