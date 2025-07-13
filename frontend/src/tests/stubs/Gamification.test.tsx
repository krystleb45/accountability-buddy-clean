import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import Gamification from '../../components/Gamification/Gamification';

describe('Gamification', () => {
  it('renders without crashing', () => {
    render(<Gamification user={null} />);
  });
});
