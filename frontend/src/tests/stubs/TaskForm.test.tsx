import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import TaskForm, { Task } from '../../components/Tasks/TaskForm';

describe('TaskForm', () => {
  it('renders without crashing', () => {
    render(
      <TaskForm
        onSubmit={function (_task: Task): void {
          throw new Error('Function not implemented.');
        }}
      />,
    );
  });
});
