// stories/Dashboard/Dashboard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import Dashboard, { DashboardProps } from '@/components/Dashboard/Dashboard';

const meta: Meta<DashboardProps> = {
  title: 'Components/Dashboard',
  component: Dashboard,
  parameters: {
    layout: 'fullscreen',
    actions: { argTypesRegex: '^on[A-Z].*' },
  },
  args: {
    userName: 'Alice',
    userStats: { totalGoals: 12, completedGoals: 9, collaborations: 4 },
    recentActivities: ['Joined a group', 'Completed a task'],
    // ← now we include the required `id` and `name`
    userProgress: {
      id: 'user-1',
      name: 'Alice',
      points: 1500,
      level: 5,
      progressToNextLevel: 60,
      pointsToNextLevel: 1000,
      streak: 0,
      badges: [],
    },
    recentBadges: [],
    points: 120,
    streakData: { currentStreak: 7, goalProgress: 80 },
  },
};
export default meta;

type Story = StoryObj<DashboardProps>;

export const Default: Story = {
  args: {
    onAction: (action) => console.log(`🚀 Action: ${action}`),
  },
};
