import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import GoalDetails from '../../components/Goals/GoalDetails';

describe('GoalDetails', () => {
  it('renders without crashing', () => {
    render(
      <GoalDetails
        goalId={''}
        onEdit={function (_id: string): void {
          throw new Error('Function not implemented.');
        }}
        onDelete={function (_id: string): void {
          throw new Error('Function not implemented.');
        }}
        onUpdateProgress={function (_id: string, _newProgress: number): void {
          throw new Error('Function not implemented.');
        }}
      />,
    );
  });
});
