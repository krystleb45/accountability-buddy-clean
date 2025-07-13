import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import CreateGoalForm, { GoalData } from '../../components/Goals/CreateGoalForm';

describe('CreateGoalForm', () => {
  it('renders without crashing', () => {
    render(
      <CreateGoalForm
        onSubmit={function (_data: GoalData): void {
          throw new Error('Function not implemented.');
        }}
      />,
    );
  });
});
