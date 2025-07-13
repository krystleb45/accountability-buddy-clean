import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import ActivityList from '../../components/Activities/ActivityList';

describe('ActivityList', () => {
  it('renders without crashing', () => {
    render(
      <ActivityList
        activities={[]}
        onViewDetails={function (_id: string): void {
          throw new Error('Function not implemented.');
        }}
        onEdit={function (_id: string): void {
          throw new Error('Function not implemented.');
        }}
        onDelete={function (_id: string): void {
          throw new Error('Function not implemented.');
        }}
      />,
    );
  });
});
