// stories/Components/Modal.stories.tsx
import React, { useState } from 'react';
import type { Meta, StoryFn } from '@storybook/react';
import Modal from '@/components/Modal/Modal';
import Button from '@/components/Buttons/Button';

// grab the real props of your Modal
type ModalProps = React.ComponentProps<typeof Modal>;
// expose only title & children to the controls
type StoryProps = Omit<ModalProps, 'isVisible' | 'onClose'>;

export default {
  title: 'Components/Modal',
  component: Modal,
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Header text shown at the top of the modal',
    },
    children: {
      control: 'text',
      description: 'Body content rendered inside the modal',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'A modal dialog component. It requires `title`, children for the body, `isVisible`, and `onClose` props.',
      },
    },
  },
} as Meta<StoryProps>;

const Template: StoryFn<StoryProps> = (args) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <>
      <Button onClick={() => setIsVisible(true)}>Open Modal</Button>
      <Modal {...args} isVisible={isVisible} onClose={() => setIsVisible(false)} />
    </>
  );
};

export const Default = Template.bind({});
Default.args = {
  title: 'Example Modal',
  // ← replace `content` with `children`
  children: 'This is a simple modal content area.',
};
