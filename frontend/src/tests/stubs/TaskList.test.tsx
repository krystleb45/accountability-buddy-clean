import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import TaskList from '../../components/Tasks/TaskList';

describe('TaskList', () => {
  it('renders without crashing', () => {
    render(
      <TaskList
        tasks={[]}
        onComplete={function (_taskId: string): void {
          throw new Error('Function not implemented.');
        }}
        onDelete={function (_taskId: string): void {
          throw new Error('Function not implemented.');
        }}
      />,
    );
  });
});
