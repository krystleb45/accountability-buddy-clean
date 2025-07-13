import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import GroupRecommendations from '../../components/Recommendations/GroupRecommendations';

describe('GroupRecommendations', () => {
  it('renders without crashing', () => {
    render(
      <GroupRecommendations
        recommendations={[]}
        onJoinGroup={function (_groupId: string): void {
          throw new Error('Function not implemented.');
        }}
      />,
    );
  });
});
