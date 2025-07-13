import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import Signup from '../../components/Forms/Signup';

describe('Signup', () => {
  it('renders without crashing', () => {
    render(<Signup />);
  });
});
