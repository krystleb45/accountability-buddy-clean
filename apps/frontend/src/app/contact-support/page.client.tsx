// src/app/contact-support/page.client.tsx
"use client"

import React, { useState } from "react"

export default function ContactSupportForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    try {
      const res = await fetch("/api/contact-support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      })

      if (!res.ok) {
        const { error: msg } = await res.json()
        throw new Error(msg || "Failed to send message")
      }

      setSuccess(true)
      setName("")
      setEmail("")
      setMessage("")
    } catch (err) {
      console.error("Contact support error:", err)
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      )
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-800 p-8">
      <h1 className="mb-4 text-3xl font-bold text-green-400">
        Contact Support
      </h1>
      <p className="mb-8 max-w-lg text-center text-lg text-gray-300">
        If you need help, please reach out to us using the form below. We’re
        here to assist you with any questions or concerns.
      </p>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-6 rounded-lg bg-gray-900 p-8 shadow-lg"
      >
        {success && (
          <div className="text-center font-medium text-green-400">
            Your message has been sent successfully!
          </div>
        )}
        {error && (
          <div className="text-center font-medium text-red-500">{error}</div>
        )}

        <div>
          <label
            htmlFor="name"
            className="mb-1 block text-sm font-medium text-gray-200"
          >
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Your Name"
            className="block w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-medium text-gray-200"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="block w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label
            htmlFor="message"
            className="mb-1 block text-sm font-medium text-gray-200"
          >
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            placeholder="Type your message here…"
            className="block w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-green-500 py-3 font-semibold uppercase text-white transition duration-150 hover:bg-green-600"
        >
          Send Message
        </button>
      </form>
    </div>
  )
}
