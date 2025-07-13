// stories/Gamification/LeaderboardPreview.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import LeaderboardPreview from '@/components/Gamification/LeaderboardPreview';

const meta: Meta<typeof LeaderboardPreview> = {
  title: 'Components/LeaderboardPreview',
  component: LeaderboardPreview,
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Title displayed above the leaderboard',
    },
    sortBy: {
      control: { type: 'select' },
      options: ['points', 'goals', 'streaks'],
      description: 'Sort order for leaderboard entries',
    },
  },
};

export default meta;
type Story = StoryObj<typeof LeaderboardPreview>;

export const Default: Story = {
  args: {
    title: 'Top Performers',
    sortBy: 'points',
    users: [
      {
        id: '1',
        name: 'Krystle',
        avatarUrl: 'https://i.pravatar.cc/100?u=krystle',
        points: 3500,
        rank: 1,
      },
      {
        id: '2',
        name: 'Alex',
        avatarUrl: 'https://i.pravatar.cc/100?u=alex',
        points: 2950,
        rank: 2,
      },
      {
        id: '3',
        name: 'Jordan',
        avatarUrl: 'https://i.pravatar.cc/100?u=jordan',
        points: 2700,
        rank: 3,
      },
    ],
  },
};
