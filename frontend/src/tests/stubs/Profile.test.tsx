import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import Profile from '../../components/Profile/Profile';

describe('Profile', () => {
  it('renders without crashing', () => {
    render(<Profile />);
  });
});
