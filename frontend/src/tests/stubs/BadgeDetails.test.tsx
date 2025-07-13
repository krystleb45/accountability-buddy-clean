import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import BadgeDetails from '../../components/BadgeSystem/BadgeDetails';
import type { Badge } from '../../components/BadgeSystem/BadgeDetails';

describe('BadgeDetails', () => {
  it('renders without crashing', () => {
    // Cast an empty object to the Badge type to satisfy the prop
    const dummyBadge = {} as Badge;

    render(<BadgeDetails badge={dummyBadge} onClose={() => {}} />);
  });
});
