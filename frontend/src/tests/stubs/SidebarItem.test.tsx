import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import SidebarItem from '../../components/Sidebar/SidebarItem';

describe('SidebarItem', () => {
  it('renders without crashing', () => {
    render(<SidebarItem label={''} />);
  });
});
