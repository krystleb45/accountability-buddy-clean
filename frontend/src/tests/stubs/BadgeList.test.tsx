import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import BadgeList from '../../components/BadgeSystem/BadgeList';

describe('BadgeList', () => {
  it('renders without crashing', () => {
    render(
      <BadgeList
        badges={[]}
        onBadgeClick={function (_id: string): void {
          throw new Error('Function not implemented.');
        }}
      />,
    );
  });
});
