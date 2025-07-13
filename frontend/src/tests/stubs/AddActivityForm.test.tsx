import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import AddActivityForm, { AddActivityFormData } from '../../components/Activities/AddActivityForm';

describe('AddActivityForm', () => {
  it('renders without crashing', () => {
    render(
      <AddActivityForm
        onSubmit={function (_data: AddActivityFormData): void {
          throw new Error('Function not implemented.');
        }}
      />,
    );
  });
});
