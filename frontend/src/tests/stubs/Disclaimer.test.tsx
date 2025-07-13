import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import Disclaimer from '../../components/UtilityComponents/Disclaimer';

describe('Disclaimer', () => {
  it('renders without crashing', () => {
    render(<Disclaimer />);
  });
});
