// src/app/debug/page.client.tsx
'use client';

import React from 'react';

export default function DebugClient(): JSX.Element {
  const env = {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_SWAGGER_URL: process.env.NEXT_PUBLIC_SWAGGER_URL,
    NEXT_PUBLIC_STRIPE_PUBLIC_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
    NEXT_PUBLIC_AUTH_PROVIDER_URL: process.env.NEXT_PUBLIC_AUTH_PROVIDER_URL,
    NEXT_PUBLIC_AUTH_CLIENT_ID: process.env.NEXT_PUBLIC_AUTH_CLIENT_ID,
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      <h1 className="mb-4 text-2xl font-bold">🔧 Debug Environment</h1>
      <pre className="overflow-auto rounded bg-gray-800 p-4 text-sm">
        {JSON.stringify(env, null, 2)}
      </pre>
    </div>
  );
}
