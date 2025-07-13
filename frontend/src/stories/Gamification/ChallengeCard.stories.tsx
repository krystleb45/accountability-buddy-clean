// stories/Gamification/ChallengeCard.stories.tsx
import React from 'react';
import type { Meta, StoryFn } from '@storybook/react';
import ChallengeCard, { ChallengeCardProps } from '@/components/Challenges/ChallengeCard';
import type { Challenge } from '@/api/challenge/challengeApi';

export default {
  title: 'Components/ChallengeCard',
  component: ChallengeCard,
  tags: ['autodocs'],
} as Meta<ChallengeCardProps>;

// all the shared fields, now with a valid milestone _id
const base: Omit<Challenge, '_id' | 'title' | 'description'> = {
  goal: 'Complete this challenge successfully',
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 7 * 86400000).toISOString(),
  status: 'ongoing',
  creator: { _id: 'admin', username: 'AdminUser' },
  participants: [
    { profilePicture: '', user: 'user1', progress: 50, joinedAt: new Date().toISOString() },
  ],
  rewards: [],
  participantCount: 1,
  visibility: 'public',
  progressTracking: 'individual',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  milestones: [
    {
      _id: 'milestone-1',           // <<< use a real string here
      title: 'Milestone 1',
      dueDate: new Date().toISOString(),
      completed: false,
      achievedBy: [],
    },
  ],
};

const Template: StoryFn<ChallengeCardProps> = (args) => <ChallengeCard {...args} />;

export const Default = Template.bind({});
Default.args = {
  userId: 'user1',
  challenge: {
    _id: 'challenge-1',
    title: '7-Day Morning Routine',
    description: 'Start your day with energy and purpose!',
    ...base,
  },
};

export const Joined = Template.bind({});
Joined.args = {
  userId: 'user1',
  challenge: {
    _id: 'challenge-2',
    title: '30-Day Fitness Challenge',
    description: 'Push your physical limits and stay consistent.',
    ...base,
    participantCount: 5,
  },
};

export const Completed = Template.bind({});
Completed.args = {
  userId: 'user1',
  challenge: {
    _id: 'challenge-3',
    title: 'Mindfulness Mastery',
    description: 'Daily meditation for clarity and peace.',
    ...base,
    status: 'completed',
    participantCount: 12,
  },
};
