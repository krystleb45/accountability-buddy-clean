import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import AuthTokenSync from '../../components/AuthTokenSync';

describe('AuthTokenSync', () => {
  it('renders without crashing', () => {
    render(<AuthTokenSync />);
  });
});
