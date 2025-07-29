// src/components/Providers.tsx
'use client';

import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { NotificationProvider } from '@/context/ui/NotificationContext';
import APIProvider from '@/context/data/APIContext';

interface Props { children: ReactNode }

export default function Providers({ children }: Props) {
  return (
    <SessionProvider>
      <APIProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </APIProvider>
    </SessionProvider>
  );
}
