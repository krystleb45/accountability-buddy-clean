import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import Modal from '../../components/Modal/Modal';

describe('Modal', () => {
  it('renders without crashing', () => {
    render(
      <Modal isVisible={false} onClose={() => {}}>
        {/* Provide a simple placeholder child */}
        <div>Modal content</div>
      </Modal>,
    );
  });
});
