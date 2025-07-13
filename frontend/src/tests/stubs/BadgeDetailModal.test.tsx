import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import BadgeDetailModal from '../../components/Modal/BadgeDetailModal';
import type { BadgeDetail } from '../../components/Modal/BadgeDetailModal';

describe('BadgeDetailModal', () => {
  it('renders without crashing', () => {
    // Bypass full structural typing with a simple cast:
    const dummyBadge = {} as BadgeDetail;

    render(<BadgeDetailModal isOpen={false} onClose={() => {}} badge={dummyBadge} />);
  });
});
