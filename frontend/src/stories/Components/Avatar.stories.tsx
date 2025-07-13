// stories/Components/UserAvatar.stories.tsx
import React from 'react';
import type { Meta, StoryFn } from '@storybook/react';
import UserAvatar from '@/components/Profile/UserAvatar';
import type { UserProfile } from '@/types/User.types';

type UserAvatarProps = React.ComponentProps<typeof UserAvatar>;

const meta: Meta<UserAvatarProps> = {
  title: 'Components/UserAvatar',
  component: UserAvatar,
  tags: ['autodocs'],
  argTypes: {
    user: {
      control: 'object',
      description: 'The user object, including id, fullName, avatarUrl, etc.',
    },
    alt: {
      control: 'text',
      description: 'Alternative text for the avatar image',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Size of the avatar',
    },
    rounded: {
      control: 'boolean',
      description: 'If true, the avatar is rendered as a circle',
    },
  },
};

export default meta;

const Template: StoryFn<UserAvatarProps> = (args) => <UserAvatar {...args} />;

// Explicitly type defaultUser so `role` is narrowed correctly to the union
const defaultUser: UserProfile = {
  id: '1',
  fullName: 'Jane Doe',
  avatarUrl: '/default-avatar.png',
  email: 'jane@example.com',
  emailVerified: true,
  role: 'user', // now valid literal of UserProfile['role']
  registeredAt: new Date().toISOString(),
  status: 'active', // valid literal of UserProfile['status']
  followers: [],
  following: [],
  pinnedGoals: [],
  featuredAchievements: [],
};

export const Default = Template.bind({});
Default.args = {
  user: defaultUser,
  alt: 'Jane Doe avatar',
  size: 'md',
  rounded: true,
};

export const Small = Template.bind({});
Small.args = {
  ...Default.args,
  size: 'sm',
};

export const Large = Template.bind({});
Large.args = {
  ...Default.args,
  size: 'lg',
};

export const Square = Template.bind({});
Square.args = {
  ...Default.args,
  rounded: false,
};
