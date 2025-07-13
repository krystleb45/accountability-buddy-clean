import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import BadgeShowcase from '../../components/BadgeSystem/BadgeShowcase';

describe('BadgeShowcase', () => {
  it('renders without crashing', () => {
    render(<BadgeShowcase />);
  });
});
