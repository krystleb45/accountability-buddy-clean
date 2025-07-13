import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import BadgeItem, { BadgeItemProps } from '../../components/BadgeSystem/BadgeItem';

describe('BadgeItem', () => {
  it('renders without crashing', () => {
    // Pull the badge prop’s type from the component’s props:
    type BadgeType = BadgeItemProps['badge'];

    // Cast an empty object to that type:
    const dummyBadge = {} as BadgeType;

    render(<BadgeItem badge={dummyBadge} />);
  });
});
