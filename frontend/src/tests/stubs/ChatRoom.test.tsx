// src/tests/stubs/ChatRoom.test.tsx
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

// 1) Mock next/navigation so useRouter (if used) doesn’t explode
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

// 2) Mock your socket helper
jest.mock('@/utils/socket', () => ({
  __esModule: true,
  default: { emit: jest.fn(), on: jest.fn(), off: jest.fn() },
  markMessageAsRead: jest.fn(),
}));

// 3) Mock your ChatContext so useChat() & ChatProvider both work
jest.mock('@/context/ChatContext', () => ({
  __esModule: true,
  ChatProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useChat: () => ({
    user: { id: 'u1', name: 'Jane' },
    messages: { test: [] },
    send: jest.fn(),
    notifyTyping: jest.fn(),
    notifyStopTyping: jest.fn(),
  }),
}));

// 4) Now import the thing under test
import { ChatProvider } from '../../context/ChatContext';
import ChatRoom from '../../components/chat/ChatRoom';

describe('ChatRoom', () => {
  it('renders without crashing', () => {
    render(
      <ChatProvider>
        <ChatRoom chatId="test" />
      </ChatProvider>
    );
  });
});
