// src/stories/Gamification/ProgressBar.stories.tsx

import React from 'react';
import type { Meta, StoryFn } from '@storybook/react';
import ProgressBar from '@/components/Progress/ProgressBar';

export default {
  title: 'Components/ProgressBar',
  component: ProgressBar,
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100 },
      description: 'Current progress value',
    },
    max: {
      control: { type: 'number', min: 1 },
      description: 'Maximum value of the progress bar',
    },
    label: {
      control: 'text',
      description: 'Optional label displayed above the bar',
    },
    color: {
      control: { type: 'select' },
      options: ['green', 'blue', 'yellow', 'purple', 'gray'],
      description: 'Color theme for the filled portion',
    },
    showText: {
      control: 'boolean',
      description: 'Whether to display the percentage text inside the bar',
    },
  },
} as Meta<typeof ProgressBar>;

const Template: StoryFn<typeof ProgressBar> = (args) => <ProgressBar {...args} />;

export const Default = Template.bind({});
Default.args = {
  value: 40,
  max: 100,
  label: 'Goal Progress',
  showText: true,
};

export const Complete = Template.bind({});
Complete.args = {
  value: 100,
  max: 100,
  label: 'Challenge Complete!',
  color: 'green',
  showText: true,
};

export const Halfway = Template.bind({});
Halfway.args = {
  value: 50,
  max: 100,
  label: 'Halfway There',
  color: 'blue',
  showText: true,
};

export const WithoutLabel = Template.bind({});
WithoutLabel.args = {
  value: 30,
  max: 100,
  showText: false,
};
