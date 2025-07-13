import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import ReminderForm from '../../components/Forms/ReminderForm';

describe('ReminderForm', () => {
  it('renders without crashing', () => {
    render(
      <ReminderForm
        goalId={''}
        onSave={function (_goalId: string, _date: string, _time: string): void {
          throw new Error('Function not implemented.');
        }}
      />,
    );
  });
});
