"use client"

import type { ReactNode } from "react"

import { useSession } from "next-auth/react" // ← Added this import
import dynamic from "next/dynamic"
import { usePathname } from "next/navigation"
import React from "react"
import { Toaster } from "react-hot-toast"

import Navbar from "@/components/Navbar/Navbar"
import NewsletterPopup from "@/components/NewsletterPopup" // ← Added this import

import AuthTokenSync from "./AuthTokenSync"

const Quotes = dynamic(() => import("./Quotes"))

interface LayoutClientProps {
  children: ReactNode
}

export default function LayoutClient({
  children,
}: LayoutClientProps): React.ReactElement {
  const pathname = usePathname() ?? ""
  const { data: session } = useSession() // ← Added this hook

  // only show the hero on exactly "/"
  const showHero = pathname === "/"

  return (
    <>
      {/* Keeps your token in sync from NextAuth to your axios interceptor */}
      <AuthTokenSync />

      {/* Global toast notifications */}
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

      {/* Top navigation */}
      <Navbar />

      {/* Military Support hero — only on the root "/" route */}
      {showHero && (
        <section className="w-full bg-gray-800 px-8 py-16 text-center text-white">
          <h2 className="text-4xl font-bold text-green-400 md:text-5xl">
            Military Support
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-lg md:text-xl">
            We offer a dedicated space for active military and veterans to find
            resources, connect, and get support.
          </p>
          <a
            href="/military-support"
            className="mt-6 inline-block rounded-lg bg-green-700 px-8 py-4 text-lg font-semibold uppercase text-white shadow-md transition duration-150 hover:bg-green-800 md:text-xl"
          >
            Access Military Support
          </a>
          <div className="mt-8">
            <Quotes />
          </div>
        </section>
      )}

      {/* Main content */}
      <main
        role="main"
        className="mx-auto flex max-w-4xl grow flex-col items-center bg-gray-900 p-8 pt-16 text-center md:pt-24"
      >
        {children}
      </main>

      {/* Global footer */}
      <footer className="w-full bg-black py-6 text-center text-base text-white md:text-lg">
        <p>&copy; {new Date().getFullYear()} Accountability Buddy.</p>
      </footer>

      {/* Newsletter popup - only show for non-authenticated users */}
      {!session?.user && <NewsletterPopup showAfterSeconds={45} />}
    </>
  )
}
