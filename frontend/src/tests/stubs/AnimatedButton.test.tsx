import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import AnimatedButton from '../../components/Buttons/AnimatedButton';

describe('AnimatedButton', () => {
  it('renders without crashing', () => {
    render(<AnimatedButton label={''} />);
  });
});
