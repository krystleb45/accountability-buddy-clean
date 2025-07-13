import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import SimpleComponent from '../../components/Simple/SimpleComponent';

describe('SimpleComponent', () => {
  it('renders without crashing', () => {
    render(<SimpleComponent />);
  });
});
