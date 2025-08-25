// 2. FIXED: src/app/military-support/layout.tsx
"use client"

import Link from "next/link"
import React from "react"

const MilitarySupportLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Military Support Header - Calming Navy & Sage Green */}
      <header className="bg-slate-700 text-white shadow-sm">
        <div className="mx-auto max-w-7xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className={`
                  text-xl font-bold transition-colors
                  hover:text-slate-200
                `}
              >
                Accountability Buddy
              </Link>
              <span className="text-slate-300">|</span>
              <h1 className="text-xl font-semibold">Military Support</h1>
            </div>

            {/* Optional Login Link - Subtle */}
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className={`
                  rounded-lg bg-slate-600 px-4 py-2 text-sm transition-colors
                  hover:bg-slate-500
                `}
              >
                Member Login
              </Link>
            </div>
          </div>

          {/* Crisis Hotline Banner - Calming but Visible */}
          <div className="mt-4 rounded-lg bg-blue-700 p-3 text-center">
            <p className="font-semibold text-blue-100">
              Crisis Support: 988 (Press 1) • Text: 838255
            </p>
            <p className="text-sm text-blue-200">
              Veterans Crisis Line - 24/7 confidential support
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* REMOVED: Context providers that might not be needed for anonymous access */}
        {children}
      </main>

      {/* Footer - Warm and Reassuring */}
      <footer className="mt-12 bg-slate-600 py-8 text-slate-200">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <p className="mb-2 text-slate-100">
            This service is free and always will be.
          </p>
          <p className="text-sm text-slate-300">
            Not affiliated with the Department of Defense or Veterans Affairs
          </p>
        </div>
      </footer>
    </div>
  )
}

export default MilitarySupportLayout
