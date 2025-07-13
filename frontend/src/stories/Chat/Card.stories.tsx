// src/stories/chat/Card.stories.tsx
import React from 'react';
import type { Meta, StoryFn } from '@storybook/react';
import Card from '@/components/cards/Card';

export default {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
  decorators: [
    // If your Card relies on global CSS or theme variables,
    // uncomment this and make sure global.css & ThemeProvider are imported in .storybook/preview.tsx
    // (Story) => (
    //   <ThemeProvider>
    //     <div className="p-4 bg-gray-900"><Story /></div>
    //   </ThemeProvider>
    // )
  ],
  argTypes: {
    onClick: {
      action: 'clicked',
      description: 'Click handler for interactive cards',
    },
    elevated: {
      control: 'boolean',
      description: 'Adds shadow for depth effect',
    },
    bordered: {
      control: 'boolean',
      description: 'Adds border around the card',
    },
    className: {
      control: 'text',
      description: 'Custom className for styling',
    },
    children: {
      control: 'text',
      description: 'Card content',
      defaultValue: 'This is a card.',
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'A flexible UI Card component used to display grouped content or actions.',
      },
    },
    actions: { handles: ['click'] }, // Listen to click events globally
  },
} as Meta<typeof Card>;

const Template: StoryFn<typeof Card> = (args) => <Card {...args}>{args.children}</Card>;

export const Default = Template.bind({});
Default.args = {
  children: 'This is a default card.',
};

export const Elevated = Template.bind({});
Elevated.args = {
  children: 'This card has an elevated shadow.',
  elevated: true,
};

export const Bordered = Template.bind({});
Bordered.args = {
  children: 'This card has a border.',
  bordered: true,
};

export const Interactive = Template.bind({});
Interactive.args = {
  children: 'This card is clickable—check the Actions panel!',
  // onClick is intentionally omitted so Storybook uses the action configured above
};

export const CustomClass = Template.bind({});
CustomClass.args = {
  children: 'This card has a custom class.',
  className: 'bg-purple-700 text-white p-4 rounded-lg',
};
