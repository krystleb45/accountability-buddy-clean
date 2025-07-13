import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import EarnBadgeNotification from '../../components/BadgeSystem/EarnBadgeNotification';

describe('EarnBadgeNotification', () => {
  it('renders without crashing', () => {
    render(
      <EarnBadgeNotification
        badgeName={''}
        badgeIcon={''}
        onClose={function (): void {
          throw new Error('Function not implemented.');
        }}
      />,
    );
  });
});
