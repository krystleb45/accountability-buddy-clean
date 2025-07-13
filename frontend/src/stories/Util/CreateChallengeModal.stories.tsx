// src/stories/Util/CreateChallengeModal.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import CreateChallengeModal from '@/components/Challenges/CreateChallengeModal';

const meta: Meta<typeof CreateChallengeModal> = {
  title: 'Components/CreateChallengeModal',
  component: CreateChallengeModal,
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Whether the modal is visible',
    },
    onClose: {
      action: 'closed',
      description: 'Fires when the user clicks cancel or backdrop',
    },
    onChallengeCreated: {
      action: 'challengeCreated',
      description: 'Fires after successful creation',
    },
  },
};

export default meta;

type Story = StoryObj<typeof CreateChallengeModal>;

export const Open: Story = {
  args: {
    isOpen: true,
    onClose: action('closed'),
    onChallengeCreated: action('challengeCreated'),
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
    onClose: action('closed'),
    onChallengeCreated: action('challengeCreated'),
  },
};
