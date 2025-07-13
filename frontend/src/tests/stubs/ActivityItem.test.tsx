import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import ActivityItem from '../../components/Activities/ActivityItem';
import type { Activity } from '../../components/Activities/ActivityItem';

describe('ActivityItem', () => {
  it('renders without crashing', () => {
    const dummyActivity = {
      id: '1',
      title: 'Test Activity',
      description: 'A brief description',
      status: 'not-started', // ← give it something so `.replace()` isn’t called on undefined
      // …and add any other required fields on your Activity type…
    } as unknown as Activity;

    render(
      <ActivityItem
        activity={dummyActivity}
        onViewDetails={(_id) => {}}
        onEdit={(_id) => {}}
        onDelete={(_id) => {}}
      />,
    );
  });
});
