// src/app/settings/page.tsx
import { Metadata } from 'next'
import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import SettingsClient from './page.client'

export const metadata: Metadata = {
  title: 'Settings – Accountability Buddy',
  description: 'Manage your notification preferences, change password, or delete your account.',
  openGraph: {
    title: 'Settings – Accountability Buddy',
    description: 'Manage your notification preferences, change password, or delete your account.',
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/settings`,
  },
}

export default async function SettingsPage() {
  // 1) Redirect unauthenticated users
  const session = await getServerSession(authOptions)
  if (!session?.user?.accessToken) {
    redirect('/login')
  }

  // 2) Authenticated → render the client
  return <SettingsClient />
}
