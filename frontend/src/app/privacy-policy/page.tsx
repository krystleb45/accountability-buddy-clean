// src/app/privacy-policy/page.tsx
import React from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy – Accountability Buddy',
  description:
    'Learn how Accountability Buddy collects, uses, and protects your personal information.',
  openGraph: {
    title: 'Privacy Policy – Accountability Buddy',
    description:
      'Learn how Accountability Buddy collects, uses, and protects your personal information.',
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/privacy-policy`,
  },
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800">Privacy Policy</h1>
        <p className="text-lg text-gray-600">
          Learn how we handle your personal information.
        </p>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl space-y-8 rounded-lg bg-white p-8 shadow-md">
        <section aria-labelledby="intro">
          <h2
            id="intro"
            className="mb-4 text-xl font-semibold text-gray-800"
          >
            Introduction
          </h2>
          <p className="text-gray-700">
            We are committed to protecting your privacy. This page explains
            how we collect, use, and share your personal information when you
            use our services.
          </p>
        </section>

        <section aria-labelledby="data-collection">
          <h2
            id="data-collection"
            className="mb-4 text-xl font-semibold text-gray-800"
          >
            Data Collection
          </h2>
          <p className="text-gray-700">
            We collect personal information that you provide directly to us,
            such as when you create an account, update your profile, or
            interact with our services. This includes your name, email
            address, and any other details you choose to share.
          </p>
        </section>

        <section aria-labelledby="data-usage">
          <h2
            id="data-usage"
            className="mb-4 text-xl font-semibold text-gray-800"
          >
            How We Use Your Data
          </h2>
          <p className="text-gray-700">
            We use your personal information to provide, improve, and promote
            our services. This may include sending you updates, processing
            your requests, or personalizing your experience.
          </p>
        </section>

        <section aria-labelledby="third-parties">
          <h2
            id="third-parties"
            className="mb-4 text-xl font-semibold text-gray-800"
          >
            Sharing with Third Parties
          </h2>
          <p className="text-gray-700">
            We may share your information with trusted third-party service
            providers to help us deliver our services, comply with legal
            obligations, or enforce our terms of service.
          </p>
        </section>

        <section aria-labelledby="contact-info">
          <h2
            id="contact-info"
            className="mb-4 text-xl font-semibold text-gray-800"
          >
            Contact Information
          </h2>
          <p className="text-gray-700">
            If you have any questions about this Privacy Policy, please
            contact us at{' '}
            <a
              href="mailto:support@accountabilitybuddy.com"
              className="text-blue-600 hover:underline"
            >
              support@accountabilitybuddy.com
            </a>
            .
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-12 text-center text-gray-600">
        &copy; {new Date().getFullYear()} Accountability Buddy. All rights
        reserved.
      </footer>
    </div>
  )
}
