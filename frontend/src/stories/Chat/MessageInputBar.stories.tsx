// .storybook/stories/Chat/MessageInputBar.stories.tsx
import React from 'react';
import type { Meta, StoryFn } from '@storybook/react';
import MessageInputBar from '@/components/chat/MessageInputBar';
import { ThemeProvider } from '@/context/ui/ThemeContext';

type Props = React.ComponentProps<typeof MessageInputBar>;

const meta: Meta<Props> = {
  title: 'Chat/MessageInputBar',
  component: MessageInputBar,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="flex min-h-screen items-end bg-gray-900 p-6">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Text shown when the input is empty',
    },
    disabled: {
      control: 'boolean',
      description: 'If true, input and send button are disabled',
    },
    // remove onSendMessage here — Storybook will auto-hook any `onXxx` callback via actions regex
  },
  parameters: {
    docs: {
      description: {
        component:
          'A chat input bar with a text field and send button. It should call your `onSendMessage`-style prop when submitting.',
      },
    },
  },
};

export default meta;

const Template: StoryFn<Props> = (args) => <MessageInputBar {...args} />;

export const Default = Template.bind({});
Default.args = {
  placeholder: 'Type a message…',
  disabled: false,
};

export const Disabled = Template.bind({});
Disabled.args = {
  placeholder: 'Cannot type here…',
  disabled: true,
};

export const CustomPlaceholder = Template.bind({});
CustomPlaceholder.args = {
  placeholder: 'Say something inspiring…',
};
