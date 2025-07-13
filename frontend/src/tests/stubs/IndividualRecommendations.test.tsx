import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import IndividualRecommendations from '../../components/Recommendations/IndividualRecommendations';

describe('IndividualRecommendations', () => {
  it('renders without crashing', () => {
    render(
      <IndividualRecommendations
        recommendations={[]}
        onConnect={function (_individualId: string): void {
          throw new Error('Function not implemented.');
        }}
      />,
    );
  });
});
