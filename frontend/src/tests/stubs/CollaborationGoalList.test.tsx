import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import CollaborationGoalList from '../../components/Collaboration/CollaborationGoalList';

describe('CollaborationGoalList', () => {
  it('renders without crashing', () => {
    render(<CollaborationGoalList />);
  });
});
