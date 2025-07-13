import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import PartnerNotifications from '../../components/Notifications/PartnerNotifications';

describe('PartnerNotifications', () => {
  it('renders without crashing', () => {
    render(<PartnerNotifications />);
  });
});
