import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import SidebarFooter from '../../components/Footer/SidebarFooter';

describe('SidebarFooter', () => {
  it('renders without crashing', () => {
    render(<SidebarFooter />);
  });
});
