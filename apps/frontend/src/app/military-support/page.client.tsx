// src/app/military-support/page.client.tsx - WITH MOOD CHECK-IN

"use client"

import {
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Heart,
  MessageSquare,
  Phone,
  Shield,
  Users,
} from "lucide-react"
import Link from "next/link"
import React, { useEffect, useState } from "react"

import type {
  Disclaimer,
  SupportResource,
} from "@/api/military-support/militarySupportApi"

import {
  fetchDisclaimer,
  fetchResources,
} from "@/api/military-support/militarySupportApi"
import {
  DEFAULT_DISCLAIMER,
  DEFAULT_MILITARY_RESOURCES,
} from "@/data/defaultMilitaryResources"

// NEW IMPORTS
import { moodCheckInApi } from "@/api/military-support/moodCheckInApi"
import CommunityMoodWidget from "@/components/MilitarySupport/CommunityMoodWidget"
import MoodCheckInModal from "@/components/MilitarySupport/MoodCheckInModal"

// Emergency contacts with calming presentation
const CRISIS_RESOURCES = [
  {
    title: "Veterans Crisis Line",
    phone: "988 (Press 1)",
    text: "Text 838255",
    description:
      "24/7 free, confidential crisis support for veterans and their families",
    urgent: true,
  },
  {
    title: "Military Crisis Line",
    phone: "1-800-273-8255",
    description: "24/7 support for active duty, National Guard, and Reserve",
    urgent: true,
  },
  {
    title: "National Suicide Prevention Lifeline",
    phone: "988",
    description: "24/7 crisis counseling and suicide prevention",
    urgent: true,
  },
]

export default function MilitarySupportPageClient() {
  const [resources, setResources] = useState<SupportResource[]>([])
  const [disclaimer, setDisclaimer] = useState<Disclaimer | null>(null)
  const [loading, setLoading] = useState(true)
  // Removed unused error state
  const [showAllResources, setShowAllResources] = useState(false)

  // NEW MOOD CHECK-IN STATE
  const [showMoodModal, setShowMoodModal] = useState(false)
  const [moodSessionId, setMoodSessionId] = useState<string>("")
  const [hasCheckedMoodToday, setHasCheckedMoodToday] = useState(false)
  const [moodSubmissionTime, setMoodSubmissionTime] = useState(0) // NEW: To force widget refresh

  // NEW: Mood check-in initialization
  const initializeMoodCheckIn = async () => {
    try {
      // Get or create session ID for mood tracking (must start with "anon_" for middleware)
      let sessionId = localStorage.getItem("military-mood-session")
      if (!sessionId || !sessionId.startsWith("anon_")) {
        sessionId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        localStorage.setItem("military-mood-session", sessionId)
      }
      setMoodSessionId(sessionId)

      // Check if user has already submitted mood today
      try {
        const hasSubmitted = await moodCheckInApi.hasSubmittedToday(sessionId)
        setHasCheckedMoodToday(hasSubmitted)

        // Show modal if they haven't checked in today (after a brief delay)
        if (!hasSubmitted) {
          setTimeout(() => {
            setShowMoodModal(true)
          }, 2000) // 2 second delay so they can see the page first
        }
      } catch (apiError) {
        console.warn(
          "Could not check daily mood status, assuming not submitted:",
          apiError,
        )
        // If API fails, show the modal anyway (better to show than hide)
        setTimeout(() => {
          setShowMoodModal(true)
        }, 2000)
      }
    } catch (error) {
      console.error("Error initializing mood check-in:", error)
      // Still create session ID even if API fails (must start with "anon_")
      const sessionId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      setMoodSessionId(sessionId)
    }
  }

  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)

        const [disclaimerResult, resourcesResult] = await Promise.all([
          fetchDisclaimer(),
          fetchResources(),
        ])

        if (disclaimerResult) {
          setDisclaimer(disclaimerResult)
        } else {
          setDisclaimer(DEFAULT_DISCLAIMER)
        }

        if (resourcesResult && resourcesResult.length > 0) {
          setResources(resourcesResult)
        } else {
          setResources(DEFAULT_MILITARY_RESOURCES)
        }
      } catch (err) {
        console.error("Error loading military support:", err)
        setDisclaimer(DEFAULT_DISCLAIMER)
        setResources(DEFAULT_MILITARY_RESOURCES)
        // Removed setError since error is not used
      } finally {
        setLoading(false)
      }
    })()

    // NEW: Initialize mood check-in system
    initializeMoodCheckIn()
  }, [])

  // NEW: Handle mood check-in submission
  const handleMoodSubmit = async (mood: number, note?: string) => {
    try {
      const result = await moodCheckInApi.submitMoodCheckIn(
        mood,
        note,
        moodSessionId,
      )
      if (result.success) {
        setHasCheckedMoodToday(true)
        console.log("✅ Mood check-in submitted successfully")

        // Force refresh the community mood widget by updating its key
        setMoodSubmissionTime(Date.now())
      } else {
        console.error("Failed to submit mood check-in:", result.message)
      }
    } catch (error) {
      console.error("Error submitting mood check-in:", error)
    }
  }

  // Show only first 6 resources initially
  const displayedResources = showAllResources
    ? resources
    : resources.slice(0, 6)

  return (
    <div className="space-y-6">
      {/* Compact Hero Section */}
      <div className="rounded-lg border-t-4 border-emerald-500 bg-white p-6 text-center shadow-sm">
        <h1 className="mb-3 text-3xl font-bold text-slate-800">
          Military Support Center
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-slate-600">
          A safe space for service members, veterans, and families. You're not
          alone.
        </p>
      </div>

      {/* NEW: Community Mood Widget */}
      <CommunityMoodWidget
        key={`mood-${hasCheckedMoodToday}-${moodSubmissionTime}`}
        className="mx-auto max-w-md"
      />

      {/* Compact Crisis Resources */}
      <section className="rounded-lg border-l-4 border-blue-400 bg-blue-50 p-6">
        <div className="mb-4 text-center">
          <div className="mb-3 flex items-center justify-center">
            <Phone className="mr-2 size-5 text-blue-600" />
            <h2 className="text-xl font-bold text-blue-800">
              Need Someone to Talk To?
            </h2>
          </div>
        </div>

        <div className="mb-4 grid gap-4 md:grid-cols-3">
          {CRISIS_RESOURCES.map((resource, index) => (
            <div
              key={index}
              className="rounded-lg border border-blue-200 bg-white p-4 text-center"
            >
              <h3 className="mb-2 text-sm font-semibold text-blue-800">
                {resource.title}
              </h3>
              <p className="mb-1 text-xl font-bold text-blue-700">
                {resource.phone}
              </p>
              {resource.text && (
                <p className="mb-2 text-sm font-semibold text-blue-600">
                  {resource.text}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-sm font-medium text-blue-700">
            Staffed by people who understand military life
          </p>
        </div>
      </section>

      {/* Disclaimer - Compact */}
      {disclaimer && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start">
            <AlertTriangle className="mr-2 mt-0.5 size-4 shrink-0 text-amber-500" />
            <p className="text-sm text-amber-800">
              <strong>Please note:</strong> {disclaimer.disclaimer}
            </p>
          </div>
        </div>
      )}

      {/* Compact Additional Resources */}
      {!loading && (
        <section className="rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-6 text-center">
            <div className="mb-3 flex items-center justify-center">
              <CheckCircle className="mr-2 size-5 text-emerald-600" />
              <h2 className="text-xl font-bold text-slate-800">
                Additional Resources
              </h2>
            </div>
          </div>

          {resources.length === 0 ? (
            <div className="py-6 text-center">
              <p className="mb-2 text-slate-500">
                No additional resources available at this time.
              </p>
              <p className="text-sm text-slate-400">
                Crisis support above is always available
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {displayedResources.map((resource) => (
                  <div
                    key={resource._id}
                    className="rounded-lg border border-slate-200 p-4 transition-all hover:border-emerald-300 hover:shadow-md"
                  >
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center"
                    >
                      <h3 className="mb-2 text-base font-semibold text-emerald-700 hover:text-emerald-800">
                        {resource.title}
                      </h3>
                      <p className="mb-3 line-clamp-2 text-sm text-slate-600">
                        {resource.description}
                      </p>
                      <div className="flex items-center justify-center text-sm font-medium text-emerald-600">
                        <span>Learn more</span>
                        <ExternalLink className="ml-1 size-3" />
                      </div>
                    </a>
                  </div>
                ))}
              </div>

              {/* Show More/Less Button */}
              {resources.length > 6 && (
                <div className="text-center">
                  <button
                    onClick={() => setShowAllResources(!showAllResources)}
                    className="inline-flex items-center rounded-lg bg-slate-100 px-4 py-2 text-slate-700 transition-colors hover:bg-slate-200"
                  >
                    {showAllResources ? (
                      <>
                        <ChevronUp className="mr-2 size-4" />
                        Show Less Resources
                      </>
                    ) : (
                      <>
                        <ChevronDown className="mr-2 size-4" />
                        Show More Resources ({resources.length - 6} more)
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* Compact Anonymous Peer Support Section */}
      <section className="rounded-lg border-t-4 border-emerald-500 bg-emerald-50 p-6 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mb-3 flex items-center justify-center">
            <Users className="mr-2 size-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-emerald-800">
              Connect with Fellow Service Members
            </h2>
          </div>
          <p className="mx-auto max-w-2xl text-emerald-700">
            Sometimes talking to someone who's been there helps. Connect
            anonymously in a safe, supportive environment.
          </p>
        </div>

        {/* Compact Feature highlights */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-emerald-200 bg-white p-4 text-center">
            <Shield className="mx-auto mb-2 size-6 text-emerald-600" />
            <h3 className="mb-1 text-sm font-semibold text-emerald-800">
              Anonymous
            </h3>
            <p className="text-xs text-emerald-700">No registration required</p>
          </div>

          <div className="rounded-lg border border-emerald-200 bg-white p-4 text-center">
            <Heart className="mx-auto mb-2 size-6 text-emerald-600" />
            <h3 className="mb-1 text-sm font-semibold text-emerald-800">
              Peer Support
            </h3>
            <p className="text-xs text-emerald-700">
              Connect with others who understand
            </p>
          </div>

          <div className="rounded-lg border border-emerald-200 bg-white p-4 text-center">
            <MessageSquare className="mx-auto mb-2 size-6 text-emerald-600" />
            <h3 className="mb-1 text-sm font-semibold text-emerald-800">
              Safe Space
            </h3>
            <p className="text-xs text-emerald-700">Moderated environment</p>
          </div>
        </div>

        {/* Chat Button */}
        <div className="text-center">
          <Link
            href="/military-support/chat"
            className="inline-flex items-center rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md"
          >
            <MessageSquare className="mr-2 size-4" />
            Join Anonymous Chat Rooms
          </Link>

          <p className="mx-auto mt-3 max-w-md text-xs text-emerald-600">
            By joining, you acknowledge this is peer support, not professional
            counseling. For crisis situations, please use the hotlines above.
          </p>
        </div>

        {/* NEW: Manual Mood Check-in Button */}
        {hasCheckedMoodToday && (
          <div className="mt-4 border-t border-emerald-200 pt-4 text-center">
            <button
              onClick={() => setShowMoodModal(true)}
              className="text-sm text-emerald-600 underline hover:text-emerald-700"
            >
              Update my daily mood check-in
            </button>
          </div>
        )}
      </section>

      {/* NEW: Mood Check-In Modal */}
      <MoodCheckInModal
        isOpen={showMoodModal}
        onClose={() => setShowMoodModal(false)}
        onSubmit={handleMoodSubmit}
        sessionId={moodSessionId}
      />
    </div>
  )
}
