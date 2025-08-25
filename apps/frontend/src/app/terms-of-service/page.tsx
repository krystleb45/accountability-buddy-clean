// File: app/terms-of-service/page.tsx

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service – Accountability Buddy",
  description:
    "Review the terms and conditions for using Accountability Buddy.",
  openGraph: {
    title: "Terms of Service – Accountability Buddy",
    description:
      "Review the terms and conditions for using Accountability Buddy.",
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/terms-of-service`,
  },
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800">Terms of Service</h1>
      </header>
      <main
        className={`
          mx-auto max-w-4xl space-y-6 rounded-lg bg-white p-8 shadow-lg
        `}
      >
        <section>
          <h2 className="mb-2 text-2xl font-semibold">1. Introduction</h2>
          <p className="text-gray-700">
            Welcome to Accountability Buddy. By using our website and services,
            you agree to these Terms of Service. Please read them carefully.
          </p>
        </section>

        {/* …other sections… */}

        <section>
          <h2 className="mb-2 text-2xl font-semibold">7. Contact Us</h2>
          <p className="text-gray-700">
            If you have any questions about these Terms of Service, please
            contact us at{" "}
            <a
              href="mailto:support@accountabilitybuddy.com"
              className={`
                text-blue-600
                hover:underline
              `}
            >
              support@accountabilitybuddy.com
            </a>
            .
          </p>
        </section>
      </main>
      <footer className="mt-8 text-center text-gray-600">
        &copy; {new Date().getFullYear()} Accountability Buddy. All rights
        reserved.
      </footer>
    </div>
  )
}
