import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import the named export, not a default
import { Textarea } from '../../components/UtilityComponents/textarea';

describe('Textarea', () => {
  it('renders without crashing', () => {
    render(<Textarea />);
  });
});
