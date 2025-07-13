import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import CreateChallengeModal from '../../components/Challenges/CreateChallengeModal';

describe('CreateChallengeModal', () => {
  it('renders without crashing', () => {
    render(
      <CreateChallengeModal
        isOpen={false}
        onClose={function (): void {
          throw new Error('Function not implemented.');
        }}
      />,
    );
  });
});
