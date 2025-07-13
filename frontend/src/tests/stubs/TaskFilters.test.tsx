// src/tests/stubs/TaskFilters.test.tsx

import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import TaskFilters, { TaskFilterValues } from '../../components/Tasks/TaskFilters';

describe('TaskFilters', () => {
  it('renders without crashing', () => {
    // use a no-op callback so the useEffect in TaskFilters can safely call it
    const noop = (_filters: TaskFilterValues) => {};
    render(<TaskFilters onFilterChange={noop} />);
  });
});
