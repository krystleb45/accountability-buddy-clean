import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import Sidebar from '../../components/Sidebar/Sidebar';

describe('Sidebar', () => {
  it('renders without crashing', () => {
    render(<Sidebar isVisible={false} />);
  });
});
