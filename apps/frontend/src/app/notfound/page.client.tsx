// src/app/not-found/page.client.tsx
"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import React from "react"

export default function NotFoundClient() {
  const router = useRouter()

  const handleRedirect = () => {
    router.replace("/") // client‐side redirect
  }

  return (
    <div
      className={`
        flex min-h-screen flex-col items-center justify-center bg-red-50 p-8
      `}
    >
      <h1 className="mb-4 text-5xl font-bold text-red-600">404</h1>
      <p className="mb-6 text-lg text-gray-700">Page Not Found</p>

      <button
        onClick={handleRedirect}
        className={`
          mb-4 rounded-lg bg-blue-600 px-6 py-3 text-white transition
          hover:bg-blue-700
        `}
        aria-label="Go to Homepage"
      >
        Go to Homepage
      </button>

      <Link
        href="/"
        className={`
          text-blue-600 underline
          hover:text-blue-800
        `}
      >
        Or click here if nothing happens
      </Link>
    </div>
  )
}
