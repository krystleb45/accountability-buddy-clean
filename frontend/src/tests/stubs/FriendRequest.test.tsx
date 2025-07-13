import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import FriendRequest from '../../components/Friend/FriendRequest';

describe('FriendRequest', () => {
  it('renders without crashing', () => {
    render(<FriendRequest />);
  });
});
