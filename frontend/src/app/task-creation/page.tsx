// src/app/task-creation/page.tsx
import type { Metadata } from 'next'
import TaskCreationClient from './page.client'

export const metadata: Metadata = {
  title: 'Create a Task – Accountability Buddy',
  description:
    'Create new tasks, set priorities and due dates, and view your existing tasks all in one place.',
  openGraph: {
    title: 'Create a Task – Accountability Buddy',
    description:
      'Create new tasks, set priorities and due dates, and view your existing tasks all in one place.',
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/task-creation`,
  },
}

export default function TaskCreationPage() {
  return <TaskCreationClient />
}
