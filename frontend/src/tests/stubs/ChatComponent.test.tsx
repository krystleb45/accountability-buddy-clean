// src/tests/stubs/ChatComponent.test.tsx
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import { ChatProvider } from '../../context/ChatContext';
import ChatComponent from '../../components/chat/ChatComponent';

describe('ChatComponent', () => {
  it('renders without crashing', () => {
    render(
      <ChatProvider>
        <ChatComponent chatId={''} />
      </ChatProvider>
    );
  });
});
