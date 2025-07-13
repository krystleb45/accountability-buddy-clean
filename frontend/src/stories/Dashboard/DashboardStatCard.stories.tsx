// stories/Dashboard/DashboardStatCard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import DashboardStatCard from '../../components/Dashboard/DashboardStatCard';

const meta: Meta<typeof DashboardStatCard> = {
  title: 'Components/DashboardStatCard',
  component: DashboardStatCard,
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Title or label for the statistic',
    },
    value: {
      control: 'text',
      description: 'Numeric or string value to display',
    },
    icon: {
      control: 'text',
      description: 'Optional icon (emoji or icon font) shown alongside the value',
    },
    color: {
      control: 'color',
      description: 'Optional color override for icon or background',
    },
  },
};
export default meta;

type Story = StoryObj<typeof DashboardStatCard>;

export const Default: Story = {
  args: {
    title: 'Goals Completed',
    value: 12,
    icon: '✅',
    color: '#22c55e', // Tailwind green-500
  },
};

export const WithLargeNumber: Story = {
  args: {
    title: 'XP Earned',
    value: 15_230,
    icon: '🧠',
    color: '#3b82f6', // Tailwind blue-500
  },
};

export const NoIcon: Story = {
  args: {
    title: 'Streak Days',
    value: 37,
    // no icon or color overrides
  },
};
