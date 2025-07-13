import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import NavbarItem from '../../components/Navbar/NavbarItem';

describe('NavbarItem', () => {
  it('renders without crashing', () => {
    render(<NavbarItem items={[]} />);
  });
});
