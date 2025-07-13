import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import Input from '../../components/UtilityComponents/Input';

describe('Input', () => {
  it('renders without crashing', () => {
    render(<Input />);
  });
});
