// src/components/MilitarySupport/AnonymousChatSelector.tsx - COMPACT VERSION

"use client"

import { ArrowLeft, Loader2, Shield, Users } from "lucide-react"
import Link from "next/link"
import React, { useEffect, useState } from "react"

import type { AnonymousChatRoom } from "@/api/military-support/anonymousMilitaryChatApi"

import { anonymousMilitaryChatApi } from "@/api/military-support/anonymousMilitaryChatApi"

export default function AnonymousChatSelector() {
  const [rooms, setRooms] = useState<AnonymousChatRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadRooms = async () => {
    try {
      setLoading(true)
      const roomsData = await anonymousMilitaryChatApi.getAnonymousRooms()
      setRooms(roomsData)
      setError(null)
    } catch (err) {
      console.error("Failed to load rooms:", err)
      setError("Failed to load chat rooms. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRooms()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2
            className={`
            mx-auto mb-4 size-12 animate-spin text-emerald-600
          `}
          />
          <p className="text-slate-600">Loading chat rooms...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <Link
            href="/military-support"
            className={`
              mb-6 inline-flex items-center text-slate-600 transition-colors
              hover:text-slate-800
            `}
          >
            <ArrowLeft className="mr-2 size-4" />
            Back to Military Support
          </Link>

          <div
            className={`
              rounded-lg border border-red-200 bg-red-50 p-6 text-center
            `}
          >
            <h2 className="mb-2 text-xl font-semibold text-red-800">
              Chat Rooms Unavailable
            </h2>
            <p className="mb-4 text-red-700">{error}</p>
            <button
              onClick={loadRooms}
              className={`
                rounded-lg bg-emerald-600 px-4 py-2 text-white transition-colors
                hover:bg-emerald-700
              `}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-50">
      {/* Compact Header */}
      <div className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <Link
            href="/military-support"
            className={`
              mb-4 inline-flex items-center text-slate-600 transition-colors
              hover:text-slate-800
            `}
          >
            <ArrowLeft className="mr-2 size-4" />
            Back to Military Support
          </Link>

          <div className="text-center">
            <h1 className="mb-2 text-3xl font-bold text-slate-800">
              Anonymous Military Chat Rooms
            </h1>
            <p className="text-slate-600">
              Connect with fellow service members in a safe, anonymous
              environment
            </p>
          </div>
        </div>
      </div>

      {/* Main Content - COMPACT WITH PROPER SPACING */}
      <div className="mx-auto max-w-6xl px-4 py-6 pb-8">
        {/* Two Column Layout: Privacy + Crisis Side by Side */}
        <div
          className={`
            mb-6 grid gap-6
            lg:grid-cols-2
          `}
        >
          {/* Privacy Notice - Compact */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
            <div className="mb-3 flex items-center justify-center">
              <Shield className="mr-2 size-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">
                Your Privacy & Safety
              </h3>
            </div>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Anonymous names assigned automatically</li>
              <li>• No registration required</li>
              <li>• Messages deleted after 24 hours</li>
              <li>• Peer support, not professional counseling</li>
            </ul>
          </div>

          {/* Crisis Resources - Compact */}
          <div className="rounded-lg border border-red-200 bg-red-50 p-6">
            <h3 className="mb-3 font-semibold text-red-900">
              Crisis? Get Help Now
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-red-800">
                  Veterans Crisis
                </div>
                <div className="font-mono text-red-700">988 (Press 1)</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-red-800">Text Support</div>
                <div className="font-mono text-red-700">838255</div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Rooms - HORIZONTAL GRID */}
        <div
          className={`
            mb-6 grid gap-6
            md:grid-cols-3
          `}
        >
          {rooms.map((room) => (
            <Link
              key={room.id}
              href={`/military-support/chat/${room.id}`}
              className="group block"
            >
              <div
                className={`
                  h-full rounded-lg border border-slate-200 bg-white p-6
                  transition-all duration-300
                  hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg
                `}
              >
                {/* Compact Room Content */}
                <div className="space-y-3 text-center">
                  {/* Icon */}
                  <div
                    className={`
                      text-4xl transition-transform duration-300
                      group-hover:scale-110
                    `}
                  >
                    {room.icon}
                  </div>

                  {/* Title */}
                  <h3
                    className={`
                      text-xl font-bold text-slate-800 transition-colors
                      group-hover:text-emerald-700
                    `}
                  >
                    {room.name}
                  </h3>

                  {/* Description - Shorter */}
                  <p className="text-sm leading-relaxed text-slate-600">
                    {room.description}
                  </p>

                  {/* Online Count - Compact */}
                  <div
                    className={`
                      flex items-center justify-center text-sm text-slate-500
                    `}
                  >
                    <Users className="mr-1 size-3" />
                    <span>{room.memberCount} online</span>
                  </div>

                  {/* Action Button */}
                  <div className="pt-2">
                    <div
                      className={`
                        rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium
                        text-emerald-700 transition-colors
                        group-hover:bg-emerald-100
                      `}
                    >
                      Join Chat
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
