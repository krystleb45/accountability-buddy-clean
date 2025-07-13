import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import NavbarDropdown from '../../components/Navbar/NavbarDropdown';

describe('NavbarDropdown', () => {
  it('renders without crashing', () => {
    render(<NavbarDropdown title={''} items={[]} />);
  });
});
