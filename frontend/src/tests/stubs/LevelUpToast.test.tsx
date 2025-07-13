import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import LevelUpToast from '../../components/Toasts/LevelUpToast';

describe('LevelUpToast', () => {
  it('renders without crashing', () => {
    render(
      <LevelUpToast
        level={0}
        show={false}
        onClose={function (): void {
          throw new Error('Function not implemented.');
        }}
      />,
    );
  });
});
