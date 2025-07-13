// src/stories/Gamification/BadgeList.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import BadgeList, { BadgeListProps } from '@/components/BadgeSystem/BadgeList';
import type { Badge } from '@/types/Gamification.types';

const meta: Meta<BadgeListProps> = {
  title: 'Components/BadgeList',
  component: BadgeList,
  tags: ['autodocs'],
  argTypes: {
    badges: {
      control: 'object',
      description: 'Array of badge objects to display',
    },
    onBadgeClick: {
      action: 'badgeClicked',
      description: 'Called when a badge is clicked',
    },
  },
};
export default meta;

type Story = StoryObj<BadgeListProps>;

const placeholderImage = 'https://via.placeholder.com/64';

export const Default: Story = {
  args: {
    badges: [
      {
        id: '1',
        name: 'Consistency',
        description: 'Completed goals for 7 days in a row.',
        imageUrl: placeholderImage,
        icon: '📆',
        badgeType: 'achievement',
        isEarned: true,
      },
      {
        id: '2',
        name: 'Streak Master',
        description: 'Maintained a 30-day streak.',
        imageUrl: placeholderImage,
        icon: '🔥',
        badgeType: 'achievement',
        isEarned: true,
      },
      {
        id: '3',
        name: 'Goal Crusher',
        description: 'Completed 100 goals.',
        imageUrl: placeholderImage,
        icon: '🏆',
        badgeType: 'achievement',
        isEarned: true,
      },
    ] as Badge[],
    // onBadgeClick will be captured by Storybook’s actions panel
  },
};

export const Empty: Story = {
  args: {
    badges: [] as Badge[],
  },
};
