import React from 'react';
import { Meta, StoryFn } from '@storybook/react';

import ForgotPassword from '../components/Forms/ForgotPassword';
import Signup from '../components/Forms/Signup';
import Register from '../components/Forms/Register';
import NewsletterSignup from '../components/Forms/NewsletterSignup';
import ResetPassword from '../components/Forms/ResetPassword';
import ReminderForm from '../components/Forms/ReminderForm';

const formWrapperStyle = { width: '100%', maxWidth: '400px', margin: 'auto' };

export default {
  title: 'Components/Forms',
  decorators: [
    (Story) => (
      <div style={formWrapperStyle}>
        <Story />
      </div>
    ),
  ],
} as Meta;

export const ForgotPasswordForm: StoryFn<typeof ForgotPassword> = () => <ForgotPassword />;
ForgotPasswordForm.storyName = 'Forgot Password Form';

export const SignUpForm: StoryFn<typeof Signup> = () => <Signup />;
SignUpForm.storyName = 'Sign Up Form';

export const RegisterForm: StoryFn<typeof Register> = () => <Register />;
RegisterForm.storyName = 'Register Form';

export const NewsletterForm: StoryFn<typeof NewsletterSignup> = () => (
  <NewsletterSignup onSubmit={(data) => console.log('Submitted', data)} />
);
NewsletterForm.storyName = 'Newsletter Signup Form';

export const ResetPasswordForm: StoryFn<typeof ResetPassword> = () => <ResetPassword />;
ResetPasswordForm.storyName = 'Reset Password Form';

export const ReminderFormStory: StoryFn<typeof ReminderForm> = () => (
  <ReminderForm
    goalId="example-goal"
    onSave={(id, date, time) => alert(`Reminder set for ${id} at ${date} ${time}`)}
  />
);
ReminderFormStory.storyName = 'Reminder Form';
