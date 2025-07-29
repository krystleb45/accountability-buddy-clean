// src/app/layout.tsx

import '../styles/global.css'
import '../styles/themes/light.css'
import '../styles/themes/dark.css'

import { ReactNode } from 'react'
import type { Metadata } from 'next'

import Providers from '@/components/Providers'
import LayoutClient from '@/components/LayoutClient'

export const metadata: Metadata = {
  title: 'Accountability Buddy',
  description: 'Your goal-tracking accountability partner.',
  openGraph: {
    title: 'Accountability Buddy',
    description: 'Your goal-tracking accountability partner.',
    url: process.env.NEXT_PUBLIC_BASE_URL as string,
    siteName: 'Accountability Buddy',
    type: 'website',
    images: [{ url: `${process.env.NEXT_PUBLIC_BASE_URL}/og-default.png` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Accountability Buddy',
    description: 'Your goal-tracking accountability partner.',
    images: [`${process.env.NEXT_PUBLIC_BASE_URL}/twitter-default.png`],
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body className="flex min-h-screen flex-col bg-gray-900 text-lg text-white md:text-xl">
        <Providers>
          <LayoutClient>{children}</LayoutClient>
        </Providers>
      </body>
    </html>
  )
}
