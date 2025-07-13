import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import Quotes from '../../components/Quotes';

describe('Quotes', () => {
  it('renders without crashing', () => {
    render(<Quotes />);
  });
});
