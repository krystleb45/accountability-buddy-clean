import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import Card from '../../components/cards/Card';

describe('Card', () => {
  it('renders without crashing', () => {
    render(
      <Card>
        {/* A simple placeholder as the child */}
        Card content
      </Card>,
    );
  });
});
