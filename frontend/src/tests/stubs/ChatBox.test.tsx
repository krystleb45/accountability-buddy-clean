// src/tests/stubs/ChatBox.test.tsx
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

// 0) Polyfill scrollIntoView on HTMLElement so the useEffect scroll call becomes a no-op
if (typeof window !== 'undefined') {
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: () => { /* no-op */ },
  });
}

// 1) Mock your ChatContext module so useChat() always returns a valid context
jest.mock('../../context/ChatContext', () => {
  const React = require('react');
  return {
    __esModule: true,
    // stub out the provider as a passthrough
    ChatProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    // stub out the hook to return the minimal shape your component needs
    useChat: () => ({
      messages: [],
      sendMessage: jest.fn(),
      loading: false,
      error: null,
    }),
  };
});

// 2) Now import the component under test
import ChatBox from '../../components/chat/ChatBox';

describe('ChatBox', () => {
  it('renders without crashing', () => {
    render(<ChatBox chatId="any-chat-id" />);
  });
});
