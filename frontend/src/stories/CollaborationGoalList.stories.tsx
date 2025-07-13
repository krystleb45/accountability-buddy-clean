import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import CollaborationGoalList from '../components/Collaboration/CollaborationGoalList';
import { CollaborationGoal } from '@/types/Collaboration.types';

export default {
  title: 'Components/CollaborationGoalList',
  component: CollaborationGoalList,
  argTypes: {
    onGoalClick: { action: 'goal clicked' },
  },
} as Meta<typeof CollaborationGoalList>;

// Sample goal data
const sampleGoals: CollaborationGoal[] = [
  {
    id: '1',
    title: 'Launch New Marketing Campaign',
    description: 'Develop and launch the Q1 marketing campaign.',
    assignedUsers: [
      { id: 'u1', name: 'Alice', email: 'alice@example.com' },
      { id: 'u2', name: 'Bob', email: 'bob@example.com' },
    ],
    dueDate: '2025-02-15',
    status: 'pending',
    progress: 0,
  },
  {
    id: '2',
    title: 'Update Product Documentation',
    description: 'Review and update the product documentation for v2.0.',
    assignedUsers: [{ id: 'u3', name: 'Charlie', email: 'charlie@example.com' }],
    dueDate: '2025-02-20',
    status: 'in-progress',
    progress: 50,
  },
  {
    id: '3',
    title: 'Complete QA Testing',
    description: 'Run the QA tests for the upcoming release.',
    assignedUsers: [
      { id: 'u4', name: 'Dave', email: 'dave@example.com' },
      { id: 'u5', name: 'Eve', email: 'eve@example.com' },
    ],
    dueDate: '2025-01-31',
    status: 'completed',
    progress: 100,
  },
];

const Template: StoryFn<typeof CollaborationGoalList> = (args) => (
  <CollaborationGoalList {...args} />
);

export const Default = Template.bind({});
Default.args = {
  goals: sampleGoals,
};

export const EmptyList = Template.bind({});
EmptyList.args = {
  goals: [],
};

export const Interactive = Template.bind({});
Interactive.args = {
  goals: sampleGoals,
  onGoalClick: (goalId: string) => alert(`Goal clicked: ${goalId}`),
};
