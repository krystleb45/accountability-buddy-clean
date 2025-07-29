// src/app/notifications/page.tsx
import type { Metadata } from 'next'
import NotificationsClient from './page.client'

export const metadata: Metadata = {
  title: 'Notifications – Accountability Buddy',
  description: 'View your latest notifications and filter by read or unread status.',
  openGraph: {
    title: 'Notifications – Accountability Buddy',
    description: 'View your latest notifications and filter by read or unread status.',
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/notifications`,
  },
}

export default function NotificationsPage() {
  return <NotificationsClient />
}
