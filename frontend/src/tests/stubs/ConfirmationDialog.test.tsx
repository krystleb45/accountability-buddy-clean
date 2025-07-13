import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import ConfirmationDialog from '../../components/PointShop/ConfirmationDialog';

describe('ConfirmationDialog', () => {
  it('renders without crashing', () => {
    render(
      <ConfirmationDialog
        isOpen={false}
        message={''}
        onConfirm={function (): void {
          throw new Error('Function not implemented.');
        }}
        onCancel={function (): void {
          throw new Error('Function not implemented.');
        }}
      />,
    );
  });
});
