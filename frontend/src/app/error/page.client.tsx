// src/app/error/page.client.tsx
'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';

export default function ErrorClient(): React.JSX.Element {
  const params = useSearchParams();
  const errorMsg = params.get('error') ?? null;

  const handleRedirect = (): void => {
    window.location.href = '/';
  };

  const handleRetry = (): void => {
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-red-50 p-8">
      <h1 className="mb-4 text-4xl font-extrabold text-red-600">
        🚨 Oops! Something went wrong.
      </h1>
      <p className="mb-4 text-lg text-gray-700">
        {errorMsg || 'An unexpected error occurred. Please try again.'}
      </p>

      {errorMsg && (
        <pre className="mb-6 overflow-auto rounded bg-gray-200 p-4 text-red-800">
          {errorMsg}
        </pre>
      )}

      <div className="flex gap-4">
        <button
          onClick={handleRetry}
          className="rounded-md bg-yellow-600 px-6 py-3 font-semibold text-white transition hover:bg-yellow-700"
        >
          🔄 Retry
        </button>
        <button
          onClick={handleRedirect}
          className="rounded-md bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          🏠 Home
        </button>
      </div>
    </div>
  );
}
