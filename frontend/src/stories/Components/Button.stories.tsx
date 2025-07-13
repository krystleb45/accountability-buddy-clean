// stories/Components/Button.stories.tsx
import React from 'react';
import type { Meta, StoryFn } from '@storybook/react';
import Button, { ButtonProps } from '@/components/Buttons/Button';

// Build a story‐friendly props type: everything in ButtonProps except `children`,
// plus a required `label` and optional `backgroundColor`.
type ButtonStoryProps = Omit<ButtonProps, 'children'> & {
  label: string;
  backgroundColor?: string;
};

const meta: Meta<ButtonStoryProps> = {
  title: 'Components/Button',
  component: Button as unknown as React.ComponentType<ButtonStoryProps>,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'danger', 'outline'] as const,
      description: 'Visual style of the button',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'] as const,
      description: 'Size of the button',
    },
    label: {
      control: 'text',
      description: 'Text to render inside the button',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the button',
    },
    loading: {
      control: 'boolean',
      description: 'Show a loading indicator',
    },
    backgroundColor: {
      control: 'color',
      description: 'Override the button’s background color via inline style',
    },
    onClick: {
      action: 'clicked',
      description: 'Click handler',
    },
  },
};

export default meta;

const Template: StoryFn<ButtonStoryProps> = (args) => (
  <Button
    {...args}
    // Only apply backgroundColor if provided
    style={args.backgroundColor ? { backgroundColor: args.backgroundColor } : undefined}
  >
    {args.label}
  </Button>
);

export const Primary = Template.bind({});
Primary.args = {
  variant: 'primary',
  label: 'Primary Button',
};

export const Secondary = Template.bind({});
Secondary.args = {
  variant: 'secondary',
  label: 'Secondary Button',
};

export const Danger = Template.bind({});
Danger.args = {
  variant: 'danger',
  label: 'Danger Button',
};

export const Outline = Template.bind({});
Outline.args = {
  variant: 'outline',
  label: 'Outline Button',
};

export const Large = Template.bind({});
Large.args = {
  size: 'lg',
  label: 'Large Button',
  variant: 'primary',
};

export const Small = Template.bind({});
Small.args = {
  size: 'sm',
  label: 'Small Button',
  variant: 'primary',
};

export const Loading = Template.bind({});
Loading.args = {
  loading: true,
  label: 'Loading…',
  variant: 'primary',
};

export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
  label: 'Disabled',
  variant: 'primary',
};

export const CustomColor = Template.bind({});
CustomColor.args = {
  label: 'Custom Color',
  variant: 'primary',
  backgroundColor: '#9b59b6',
};
