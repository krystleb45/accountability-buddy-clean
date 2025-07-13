// stories/Components/Badge.stories.tsx
import React from 'react';
import type { Meta, StoryFn } from '@storybook/react';
import Badge from '@/components/BadgeSystem/Badge';

type BadgeProps = React.ComponentProps<typeof Badge>;

const meta: Meta<BadgeProps> = {
  title: 'Components/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Text label displayed inside the badge',
    },
    type: {
      control: { type: 'select' },
      options: ['success', 'warning', 'error', 'info'] as const,
      description: 'Visual style variant of the badge',
    },
    icon: {
      control: 'text',
      description: 'Optional icon (e.g. emoji or icon name) shown alongside the label',
    },
    color: {
      control: 'color',
      description: 'Override background color of the badge',
    },
  },
};

export default meta;

const Template: StoryFn<BadgeProps> = (args) => <Badge {...args} />;

export const Default = Template.bind({});
Default.args = {
  label: 'New',
};

export const WithIcon = Template.bind({});
WithIcon.args = {
  label: 'Achieved',
  icon: '🏆',
};

export const Success = Template.bind({});
Success.args = {
  label: 'Level Up',
  type: 'success',
};

export const Warning = Template.bind({});
Warning.args = {
  label: 'Streak Lost',
  type: 'warning',
};

export const Error = Template.bind({});
Error.args = {
  label: 'Oops!',
  type: 'error',
};

export const CustomColor = Template.bind({});
CustomColor.args = {
  label: 'Limited',
  color: '#9b59b6',
};
