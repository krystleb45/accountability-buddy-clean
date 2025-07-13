// stories/Dashboard/PointsBalance.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import PointsBalance, { PointsBalanceProps } from '@/components/Dashboard/PointsBalance';

const meta: Meta<PointsBalanceProps> = {
  title: 'Components/PointsBalance',
  component: PointsBalance,
  tags: ['autodocs'],
  argTypes: {
    points: {
      control: 'number',
      description: 'Current points balance to display',
    },
    level: {
      control: 'number',
      description: 'Optional user level displayed under points',
    },
  },
};

export default meta;
type Story = StoryObj<PointsBalanceProps>;

export const Default: Story = {
  args: {
    points: 1250,
    level: 3,
  },
};

export const ZeroPoints: Story = {
  args: {
    points: 0,
    level: 1,
  },
};

export const HighPoints: Story = {
  args: {
    points: 9875,
    level: 12,
  },
};

export const PointsOnly: Story = {
  args: {
    points: 500,
    // no level passed
  },
};
