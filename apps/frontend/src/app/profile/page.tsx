// src/app/profile/page.tsx
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import ProfileClient from './Page.Client'
import type { ProfileData } from '@/api/profile/profileApi'

export const metadata: Metadata = {
  title:       'Your Profile – Accountability Buddy',
  description: 'View and update your personal profile information.',
  openGraph: {
    title:       'Your Profile – Accountability Buddy',
    description: 'View and update your personal profile information.',
    url:         `${process.env.NEXT_PUBLIC_BASE_URL}/profile`,
  },
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.accessToken) {
    redirect('/login')
  }

  const res = await fetch(
    `${process.env.BACKEND_URL}/api/profile`,
    {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
      },
      cache: 'no-store',
    }
  )

  if (!res.ok) {
    redirect('/dashboard')
  }

  // unwrap the envelope
  const { data: initialProfile } = await res.json() as { data: ProfileData }

  return (
    <div className="min-h-screen bg-black p-6 text-white">
      <div className="mx-auto max-w-4xl rounded-lg bg-gray-900 shadow-lg">
        <ProfileClient initialProfile={initialProfile} />
      </div>
    </div>
  )
}
