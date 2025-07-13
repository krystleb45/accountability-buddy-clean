import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import ResourceLinks from '../../components/Settings/ResourceLinks';

describe('ResourceLinks', () => {
  it('renders without crashing', () => {
    render(<ResourceLinks />);
  });
});
