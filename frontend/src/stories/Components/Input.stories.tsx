// stories/Components/Input.stories.tsx
import React from 'react';
import type { Meta, StoryFn } from '@storybook/react';
import Input from '@/components/UtilityComponents/Input';

interface InputProps {
  type?: 'text' | 'password' | 'email' | 'number';
  placeholder?: string;
  value?: string;
  disabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const meta: Meta<InputProps> = {
  title: 'Components/Input',
  component: Input as React.ComponentType<InputProps>,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['text', 'password', 'email', 'number'],
      description: 'The HTML input type',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text when the field is empty',
    },
    value: {
      control: 'text',
      description: 'Controlled value of the input',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
    onChange: {
      action: 'changed',
      description: 'Callback invoked on value change',
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'A styled `<input>` wrapper with built-in label, error, and focus handling.',
      },
    },
  },
};

export default meta;

const Template: StoryFn<InputProps> = (args) => <Input {...args} />;

export const Default = Template.bind({});
Default.args = {
  placeholder: 'Enter text...',
};

export const Password = Template.bind({});
Password.args = {
  type: 'password',
  placeholder: 'Enter password',
};

export const Email = Template.bind({});
Email.args = {
  type: 'email',
  placeholder: 'Enter email',
};

export const Number = Template.bind({});
Number.args = {
  type: 'number',
  placeholder: 'Enter a number',
};

export const Disabled = Template.bind({});
Disabled.args = {
  placeholder: 'Disabled input',
  disabled: true,
};
