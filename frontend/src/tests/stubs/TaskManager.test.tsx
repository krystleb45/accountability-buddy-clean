import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import TaskManager from '../../components/Tasks/TaskManager';

describe('TaskManager', () => {
  it('renders without crashing', () => {
    render(<TaskManager />);
  });
});
