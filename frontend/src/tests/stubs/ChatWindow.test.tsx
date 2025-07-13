// src/tests/stubs/ChatWindow.test.tsx
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

// 1) Stub out the scrolling API (if not already in setupTests)
Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
  value: () => { /* no-op */ },
  writable: true,
});

// 2) Mock socket so import never tries to open a real connection
jest.mock('@/utils/socket', () => ({
  __esModule: true,
  default: { emit: jest.fn(), on: jest.fn(), off: jest.fn() },
  markMessageAsRead: jest.fn(),
}));

// 3) Mock your timestamp helper
jest.mock('../../utils/ChatUtils', () => ({
  __esModule: true,
  formatTimestamp: () => '12:34 PM',
}));

// 4) Mock the emoji picker component
jest.mock('../../components/chat/EmojiPicker', () => ({
  __esModule: true,
  default: () => <div data-testid="emoji-picker" />,
}));

// 5) Mock the two icons you're using
jest.mock('react-icons/fa', () => ({
  __esModule: true,
  FaPlay: () => <span data-testid="play-icon" />,
  FaPause: () => <span data-testid="pause-icon" />,
}));

// 6) Finally mock your ChatContext so useChat()/ChatProvider both work
jest.mock('@/context/ChatContext', () => ({
  __esModule: true,
  ChatProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useChat: () => ({
    messages: { myChatId: [] },
    send: jest.fn(),
    notifyTyping: jest.fn(),
    notifyStopTyping: jest.fn(),
  }),
}));

// Now import the real component:
import ChatWindow from '../../components/chat/ChatWindow';

describe('ChatWindow', () => {
  it('renders without crashing', () => {
    render(<ChatWindow chatId="myChatId" currentUserId="user1" />);
  });
});
