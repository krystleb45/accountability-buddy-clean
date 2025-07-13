import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import PinButton from '../../components/Buttons/PinButton';

describe('PinButton', () => {
  it('renders without crashing', () => {
    render(
      <PinButton
        isPinned={false}
        onToggle={function (): void {
          throw new Error('Function not implemented.');
        }}
      />,
    );
  });
});
