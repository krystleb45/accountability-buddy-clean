import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import Notification from '../../components/Notifications/Notification';

describe('Notification', () => {
  it('renders without crashing', () => {
    render(<Notification message={''} />);
  });
});
