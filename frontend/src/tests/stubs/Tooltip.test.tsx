import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import Tooltip from '../../components/UtilityComponents/Tooltip';

describe('Tooltip', () => {
  it('renders without crashing', () => {
    render(
      <Tooltip content="Helpful tip">
        <span>Hover me</span>
      </Tooltip>,
    );
  });
});
