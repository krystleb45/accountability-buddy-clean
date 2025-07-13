import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import MessageInputBar from '../../components/chat/MessageInputBar';

describe('MessageInputBar', () => {
  it('renders without crashing', () => {
    render(
      <MessageInputBar
        onSend={function (_message: string): void {
          throw new Error('Function not implemented.');
        }}
      />,
    );
  });
});
