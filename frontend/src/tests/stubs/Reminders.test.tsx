import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import Reminders from '../../components/Notifications/Reminders';

describe('Reminders', () => {
  it('renders without crashing', () => {
    render(<Reminders />);
  });
});
