// src/stories/Gamification/StreakTracker.stories.tsx

import React from 'react';
import type { Meta, StoryFn } from '@storybook/react';
import StreakTracker, { StreakTrackerProps } from '@/components/Gamification/StreakTracker';

export default {
  title: 'Components/StreakTracker',
  component: StreakTracker,
  tags: ['autodocs'],
  argTypes: {
    currentStreak: {
      control: { type: 'number', min: 0 },
      description: 'Number of consecutive days you have met your goal',
    },
    longestStreak: {
      control: { type: 'number', min: 0 },
      description: 'Your record for the longest consecutive streak',
    },
    goalProgress: {
      control: { type: 'number', min: 0, max: 100 },
      description: 'Progress toward today’s goal as a percentage',
    },
  },
} as Meta<StreakTrackerProps>;

const Template: StoryFn<StreakTrackerProps> = (args) => <StreakTracker {...args} />;

export const Default = Template.bind({});
Default.args = {
  currentStreak: 7,
  longestStreak: 30,
  goalProgress: 50,
};

export const NewStreak = Template.bind({});
NewStreak.args = {
  currentStreak: 1,
  longestStreak: 1,
  goalProgress: 10,
};

export const LongestStreakAchieved = Template.bind({});
LongestStreakAchieved.args = {
  currentStreak: 50,
  longestStreak: 50,
  goalProgress: 100,
};
