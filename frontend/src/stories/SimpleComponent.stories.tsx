// src/components/Simple/SimpleComponent.stories.tsx
import { Meta, StoryObj } from '@storybook/react';
import SimpleComponent from '../components/Simple/SimpleComponent';

const meta: Meta<typeof SimpleComponent> = {
  title: 'Components/SimpleComponent',
  component: SimpleComponent,
  argTypes: {
    message: { control: 'text' },
    className: { control: 'text' },
    id: { control: 'text' },
  },
};
export default meta;

type Story = StoryObj<typeof SimpleComponent>;

export const Default: Story = {
  args: {
    message: 'Simple Component',
  },
};

export const CustomMessage: Story = {
  args: {
    message: 'Custom Message',
  },
};

export const StyledComponent: Story = {
  args: {
    message: 'Styled Component',
    className: 'custom-class',
  },
};

export const WithID: Story = {
  args: {
    message: 'Component with ID',
    id: 'custom-id',
  },
};
