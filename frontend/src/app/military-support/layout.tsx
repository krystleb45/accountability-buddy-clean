// 2. FIXED: src/app/military-support/layout.tsx
'use client';

import React from 'react';
import Link from 'next/link';

const MilitarySupportLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Military Support Header - Calming Navy & Sage Green */}
      <header className="bg-slate-700 text-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-xl font-bold hover:text-slate-200 transition-colors">
                Accountability Buddy
              </Link>
              <span className="text-slate-300">|</span>
              <h1 className="text-xl font-semibold">Military Support</h1>
            </div>

            {/* Optional Login Link - Subtle */}
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="bg-slate-600 hover:bg-slate-500 px-4 py-2 rounded-lg transition-colors text-sm"
              >
                Member Login
              </Link>
            </div>
          </div>

          {/* Crisis Hotline Banner - Calming but Visible */}
          <div className="mt-4 bg-blue-700 rounded-lg p-3 text-center">
            <p className="font-semibold text-blue-100">Crisis Support: 988 (Press 1) • Text: 838255</p>
            <p className="text-sm text-blue-200">Veterans Crisis Line - 24/7 confidential support</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* REMOVED: Context providers that might not be needed for anonymous access */}
        {children}
      </main>

      {/* Footer - Warm and Reassuring */}
      <footer className="bg-slate-600 text-slate-200 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="mb-2 text-slate-100">This service is free and always will be.</p>
          <p className="text-slate-300 text-sm">
            Not affiliated with the Department of Defense or Veterans Affairs
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MilitarySupportLayout;
