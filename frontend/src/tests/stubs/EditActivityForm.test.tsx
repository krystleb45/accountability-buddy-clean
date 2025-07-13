import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import EditActivityForm, {
  EditActivityFormProps,
} from '../../components/Activities/EditActivityForm';

describe('EditActivityForm', () => {
  it('renders without crashing', () => {
    // Extract the ActivityData type from props
    type ActivityDataType = EditActivityFormProps['activity'];
    // Cast an empty object to satisfy the required prop
    const dummyActivity = {} as ActivityDataType;

    render(
      <EditActivityForm
        activity={dummyActivity}
        onSubmit={(_updated: ActivityDataType) => {}} // underscore to avoid unused‐var warning
      />,
    );
  });
});
