import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import Button from '../../components/Buttons/Button';

describe('Button', () => {
  it('renders without crashing', () => {
    // Pass a simple string as the child rather than using the `children` prop
    render(<Button>Click me</Button>);
  });
});
