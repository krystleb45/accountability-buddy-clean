// src/stories/Util/CreateGoalForm.stories.tsx

import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import CreateGoalForm from '@/components/Goals/CreateGoalForm';

const meta: Meta<typeof CreateGoalForm> = {
  title: 'Components/CreateGoalForm',
  component: CreateGoalForm,
  tags: ['autodocs'],
  argTypes: {
    onSubmit: { action: 'submitted', description: 'Called with the form data' },
    defaultValues: {
      control: 'object',
      description: 'Optional initial form values',
    },
  },
};

export default meta;
type Story = StoryObj<typeof CreateGoalForm>;

export const EmptyForm: Story = {
  args: {
    onSubmit: action('submitted'),
  },
};

export const PreFilled: Story = {
  args: {
    onSubmit: action('submitted'),
    defaultValues: {
      title: 'Read 10 Pages Daily',
      description: 'Finish one book per month by reading every day.',
      category: 'Personal Development',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), // 2 weeks from today
    },
  },
};
