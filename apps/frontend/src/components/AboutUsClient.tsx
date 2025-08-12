// src/components/AboutUsClient.tsx
"use client"

import { motion } from "motion/react"
import React from "react"

export default function AboutUsClient() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-black p-6 text-white">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl rounded-lg bg-gray-900 p-8 shadow-lg"
      >
        <header className="mb-8 text-center" aria-labelledby="page-title">
          <h1
            id="page-title"
            className="mb-4 text-4xl font-extrabold text-kelly-green"
          >
            About Accountability Buddy
          </h1>
          <p className="text-lg text-gray-300">
            Empowering individuals to achieve their goals through accountability
            and community.
          </p>
        </header>

        <main>
          <section aria-labelledby="our-mission" className="mb-8">
            <h2
              id="our-mission"
              className="mb-4 text-2xl font-bold text-kelly-green"
            >
              Our Mission
            </h2>
            <p className="leading-relaxed text-gray-300">
              At Accountability Buddy, we believe in the power of support and
              consistency. Our mission is to help individuals achieve their
              personal and professional goals by providing a platform that
              encourages accountability and fosters a sense of community.
            </p>
          </section>

          <section aria-labelledby="what-we-offer" className="mb-8">
            <h2
              id="what-we-offer"
              className="mb-4 text-2xl font-bold text-kelly-green"
            >
              What We Offer
            </h2>
            <ul className="list-inside list-disc text-gray-300">
              <li>Goal tracking and progress analytics</li>
              <li>Personalized recommendations for accountability groups</li>
              <li>Engaging leaderboards and rewards</li>
              <li>Private and group chatrooms for support</li>
            </ul>
          </section>

          <section aria-labelledby="join-us">
            <h2
              id="join-us"
              className="mb-4 text-2xl font-bold text-kelly-green"
            >
              Join Us
            </h2>
            <p className="text-gray-300">
              Join our growing community of goal-oriented individuals and start
              your accountability journey today. Together, we can achieve great
              things!
            </p>
          </section>
        </main>

        <footer className="mt-12 text-center text-gray-400">
          &copy; {new Date().getFullYear()} Accountability Buddy. All rights
          reserved.
        </footer>
      </motion.div>
    </div>
  )
}
