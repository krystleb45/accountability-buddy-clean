import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import Loader from '../../components/UtilityComponents/Loader';

describe('Loader', () => {
  it('renders without crashing', () => {
    render(<Loader />);
  });
});
