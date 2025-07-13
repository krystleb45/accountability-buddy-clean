// .storybook/stories/Chat/ChatBubble.stories.tsx
import React from 'react';
import type { Meta, StoryFn } from '@storybook/react';
import { ThemeProvider } from '@/context/ui/ThemeContext';
import ChatBubble from '@/components/chat/ChatBubble';

// Pull the prop-types straight from the component:
type ChatBubbleProps = React.ComponentProps<typeof ChatBubble>;

const meta: Meta<ChatBubbleProps> = {
  title: 'Chat/ChatBubble',
  component: ChatBubble,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="flex min-h-screen items-center justify-center bg-gray-900 p-6">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  argTypes: {
    message: {
      control: 'text',
      description: 'The message content inside the chat bubble.',
    },
    isSender: {
      control: 'boolean',
      description: 'If `true`, aligns the bubble to the right (sender).',
    },
    timestamp: {
      control: 'text',
      description: 'Optional timestamp string to display underneath.',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'A chat bubble that displays a message, timestamp, and flips alignment for sender vs. receiver.',
      },
    },
  },
};
export default meta;

const Template: StoryFn<ChatBubbleProps> = (args) => <ChatBubble {...args} />;

export const Receiver = Template.bind({});
Receiver.args = {
  message: 'Hey there! How’s it going?',
  isSender: false,
  timestamp: '2:35 PM',
};

export const Sender = Template.bind({});
Sender.args = {
  message: 'Doing great! Just finishing up the project.',
  isSender: true,
  timestamp: '2:36 PM',
};

export const LongMessage = Template.bind({});
LongMessage.args = {
  message:
    'This is a much longer message bubble that spans multiple lines to demonstrate how the component handles large chunks of text gracefully in the chat interface. It should wrap correctly and keep padding consistent.',
  isSender: true,
  timestamp: '2:37 PM',
};
