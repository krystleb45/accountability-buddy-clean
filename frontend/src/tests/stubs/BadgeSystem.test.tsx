import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import BadgeSystem from '../../components/BadgeSystem/BadgeSystem';

describe('BadgeSystem', () => {
  it('renders without crashing', () => {
    render(<BadgeSystem badges={[]} />);
  });
});
