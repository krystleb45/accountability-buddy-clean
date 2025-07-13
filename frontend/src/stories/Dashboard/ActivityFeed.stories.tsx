// stories/Dashboard/ActivityFeed.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import Feed, { FeedPost } from '@/components/Activities/Feed';

const meta: Meta<typeof Feed> = {
  title: 'Components/ActivityFeed',
  component: Feed,
  tags: ['autodocs'],
  argTypes: {
    posts: {
      control: 'object',
      description: 'Array of feed posts to render',
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'A chronological list of user activities. Pass in an array of `FeedPost` items.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Feed>;

export const Default: Story = {
  args: {
    posts: [
      {
        id: '1',
        title: 'Workout Completed',
        content: 'Completed the challenge "30-Day Workout"',
        author: 'Krystle',
        timestamp: '5 minutes ago',
        likes: 0,
        comments: 0,
      },
      {
        id: '2',
        title: 'Badge Earned',
        content: 'Earned the "Consistency" badge',
        author: 'Jordan',
        timestamp: '20 minutes ago',
        likes: 2,
        comments: 1,
      },
      {
        id: '3',
        title: 'Group Joined',
        content: 'Joined your accountability group',
        author: 'Sasha',
        timestamp: '1 hour ago',
        likes: 0,
        comments: 0,
      },
    ] as FeedPost[],
  },
};

export const Empty: Story = {
  args: {
    posts: [] as FeedPost[],
  },
};
