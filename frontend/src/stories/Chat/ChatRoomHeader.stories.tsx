// .storybook/stories/Chat/ChatRoomHeader.stories.tsx
import React from 'react';
import type { Meta, StoryFn } from '@storybook/react';
import { ThemeProvider } from '@/context/ui/ThemeContext';
import ChatRoomHeader from '@/components/chat/ChatRoomHeader';

// Define a local Args type so TS never has to reference your component's un-exported props
type ChatRoomHeaderArgs = {
  title: string;
  participantCount: number;
  status?: 'online' | 'offline' | 'busy' | 'away';
  onBack?: () => void;
};

const meta: Meta<ChatRoomHeaderArgs> = {
  title: 'Chat/ChatRoomHeader',
  component: ChatRoomHeader,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="flex min-h-screen items-start justify-center bg-gray-900 p-6">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Title of the chat room',
    },
    participantCount: {
      control: 'number',
      description: 'Number of people currently in the room',
    },
    status: {
      control: { type: 'select' },
      options: ['online', 'offline', 'busy', 'away'],
      description: 'Presence status badge',
    },
    onBack: {
      action: 'back-clicked',
      description: 'Callback when the back button is pressed',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Displays a header with room title, participant count, an optional back button, and an optional status badge.',
      },
    },
  },
};

export default meta;

const Template: StoryFn<ChatRoomHeaderArgs> = (args) => <ChatRoomHeader {...args} />;

export const Default = Template.bind({});
Default.args = {
  title: 'General Chat',
  participantCount: 5,
};

export const WithBack = Template.bind({});
WithBack.args = {
  title: 'General Chat',
  participantCount: 5,
  onBack: () => {}, // now valid!
};

export const Online = Template.bind({});
Online.args = {
  title: 'Team Standup',
  participantCount: 3,
  status: 'online',
};

export const Offline = Template.bind({});
Offline.args = {
  title: 'Project Planning',
  participantCount: 2,
  status: 'offline',
};

export const Busy = Template.bind({});
Busy.args = {
  title: 'Customer Support',
  participantCount: 8,
  status: 'busy',
};

export const Away = Template.bind({});
Away.args = {
  title: 'Design Review',
  participantCount: 4,
  status: 'away',
  onBack: () => {}, // also valid here
};
