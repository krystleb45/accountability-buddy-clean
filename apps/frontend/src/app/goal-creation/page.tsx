// src/app/goal-creation/page.tsx
import GoalCreationClient from './page.client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Goals • Accountability Buddy',
  description: 'Set, track, and manage your goals with customizable reminders.',
  openGraph: {
    title: 'Create Goals • Accountability Buddy',
    description: 'Set, track, and manage your goals with customizable reminders.',
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/goal-creation`,
  },
};

export default function GoalCreationPage() {
  return <GoalCreationClient />;
}
