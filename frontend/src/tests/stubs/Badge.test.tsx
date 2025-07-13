import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import Badge from '../../components/BadgeSystem/Badge';

describe('Badge', () => {
  it('renders without crashing', () => {
    render(<Badge label={''} />);
  });
});
