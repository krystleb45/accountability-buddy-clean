"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import React from "react"

export default function WelcomeClient() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-8 text-white">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-lg rounded-lg bg-gray-900 p-10 text-center shadow-lg"
      >
        <h1 className="mb-6 text-4xl font-bold text-kelly-green">Welcome!</h1>
        <p className="mb-8 text-lg text-gray-300">
          We’re excited to have you on board. Start setting your goals and
          connecting with accountability partners today!
        </p>
        <Link
          href="/dashboard"
          className="rounded-lg bg-kelly-green px-6 py-3 text-lg font-semibold text-black transition hover:bg-opacity-80"
        >
          Go to Dashboard
        </Link>
      </motion.div>
    </div>
  )
}
