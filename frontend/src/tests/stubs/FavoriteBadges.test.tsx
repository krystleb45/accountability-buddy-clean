import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import FavoriteBadges from '../../components/BadgeSystem/FavoriteBadges';

describe('FavoriteBadges', () => {
  it('renders without crashing', () => {
    render(<FavoriteBadges />);
  });
});
