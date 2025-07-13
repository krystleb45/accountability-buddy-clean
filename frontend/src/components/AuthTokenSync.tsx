// src/components/AuthTokenSync.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

export default function AuthTokenSync(): null {
  const { data: session } = useSession();

  useEffect(() => {
    const token = session?.user.accessToken;
    if (token) {
      // Store under the same key your http interceptor reads
      sessionStorage.setItem('token', token);
    } else {
      sessionStorage.removeItem('token');
    }
  }, [session]);

  return null;
}
