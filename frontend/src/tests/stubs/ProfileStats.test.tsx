import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import ProfileStats from '../../components/Profile/ProfileStats';

describe('ProfileStats', () => {
  it('renders without crashing', () => {
    render(<ProfileStats userId={''} />);
  });
});
