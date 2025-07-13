import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import Footer from '../components/Footer/Footer';

export default {
  title: 'Components/Footer',
  component: Footer,
  parameters: {
    layout: 'fullscreen', // Ensures the footer spans the full width of the viewport
  },
} as Meta<typeof Footer>;

const Template: StoryFn<typeof Footer> = () => <Footer />;

export const Default = Template.bind({});
Default.storyName = 'Default Footer';

export const WithLinks: StoryFn<typeof Footer> = () => (
  <div
    style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
    }}
  >
    <Footer />
  </div>
);

WithLinks.storyName = 'Footer with Sample Links';
