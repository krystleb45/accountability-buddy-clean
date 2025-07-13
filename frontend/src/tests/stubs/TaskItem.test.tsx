import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import TaskItem from '../../components/Tasks/TaskItem';

// Pull in the props type to extract `task` and callback signatures
type Props = React.ComponentProps<typeof TaskItem>;
type TaskType = Props['task'];
type CompleteArg = Parameters<Props['onComplete']>[0];
type DeleteArg = Parameters<Props['onDelete']>[0];

describe('TaskItem', () => {
  it('renders without crashing', () => {
    // Cast an empty object to satisfy the required `task` prop
    const dummyTask = {} as TaskType;

    render(
      <TaskItem
        task={dummyTask}
        onComplete={(_id: CompleteArg) => {}}
        onDelete={(_id: DeleteArg) => {}}
      />,
    );
  });
});
