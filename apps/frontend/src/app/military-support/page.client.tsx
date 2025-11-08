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
import { useEffect, useState } from "react"

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
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"

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
    <div className="-mb-4 space-y-6">
      {/* Compact Hero Section */}
      <div>
        <h2 className="text-2xl font-bold">Military Support Center</h2>
        <p className="max-w-prose text-muted-foreground">
          A safe space for service members, veterans, and families. You're not
          alone.
        </p>
      </div>

      <div
        className={`
          grid grid-cols-1 gap-6
          lg:grid-cols-2
        `}
      >
        {/* NEW: Community Mood Widget */}
        <CommunityMoodWidget
          key={`mood-${hasCheckedMoodToday}-${moodSubmissionTime}`}
        />

        {/* Compact Crisis Resources */}
        <section>
          <Card className="h-full border-chart-2 bg-chart-2/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="size-5 text-chart-2" />
                <span>Need Someone to Talk To?</span>
              </CardTitle>
            </CardHeader>

            <CardContent
              className={`
                grid gap-3
                md:grid-cols-3
              `}
            >
              {CRISIS_RESOURCES.map((resource) => (
                <Card key={resource.title} className="gap-2 bg-chart-2/10">
                  <CardHeader>
                    <CardTitle className="text-sm text-balance text-chart-2">
                      {resource.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl font-bold">{resource.phone}</p>
                  </CardContent>
                  <CardFooter>
                    {resource.text && (
                      <p className="text-sm font-semibold text-chart-2/50">
                        {resource.text}
                      </p>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </CardContent>

            <CardFooter className="mt-auto">
              <p className="text-sm font-medium text-muted-foreground">
                Staffed by people who understand military life
              </p>
            </CardFooter>
          </Card>
        </section>
      </div>

      {/* Disclaimer - Compact */}
      {disclaimer && (
        <Card className="border-chart-3 bg-chart-3/10 py-4">
          <CardContent className="flex items-center gap-3">
            <AlertTriangle className="shrink-0 text-chart-3" />
            <p className="text-sm text-pretty text-chart-3">
              <strong>Please note:</strong> {disclaimer.disclaimer}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Compact Additional Resources */}
      {!loading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="size-5 text-primary" />
              <h2>Additional Resources</h2>
            </CardTitle>
          </CardHeader>

          <CardContent>
            {resources.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyTitle>
                    No additional resources available at this time.
                  </EmptyTitle>
                  <EmptyDescription>
                    Crisis support above is always available
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <>
                <div
                  className={`
                    mb-6 grid gap-4
                    md:grid-cols-2
                    lg:grid-cols-3
                  `}
                >
                  {displayedResources.map((resource) => (
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                      key={resource._id}
                    >
                      <Card
                        className={`
                          gap-2 py-4 transition-all
                          hover:border-primary
                        `}
                      >
                        <CardHeader>
                          <CardTitle
                            // prettier-ignore
                            className="text-base text-balance text-primary"
                          >
                            {resource.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            {resource.description}
                          </p>
                        </CardContent>
                        <CardFooter className="justify-center">
                          <Button variant="link" size="sm" asChild>
                            <span>
                              <span>Learn more</span>
                              <ExternalLink />
                            </span>
                          </Button>
                        </CardFooter>
                      </Card>
                    </a>
                  ))}
                </div>

                {/* Show More/Less Button */}
                {resources.length > 6 && (
                  <div className="text-center">
                    <Button
                      onClick={() => setShowAllResources(!showAllResources)}
                      variant="secondary"
                    >
                      {showAllResources ? (
                        <>
                          <ChevronUp />
                          Show Less Resources
                        </>
                      ) : (
                        <>
                          <ChevronDown />
                          Show More Resources ({resources.length - 6} more)
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Compact Anonymous Peer Support Section */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5 text-primary" />
              <h2>Connect with Fellow Service Members</h2>
            </CardTitle>
            <CardDescription>
              Sometimes talking to someone who's been there helps. Connect
              anonymously in a safe, supportive environment.
            </CardDescription>
          </CardHeader>

          {/* Compact Feature highlights */}
          <CardContent>
            <div
              className={`
                grid gap-4
                md:grid-cols-3
              `}
            >
              <Card className="gap-4 bg-primary/10 text-center">
                <Shield className="mx-auto size-8 text-primary" />
                <CardHeader>
                  <CardTitle>Anonymous</CardTitle>
                  <p className="text-xs text-primary">
                    No registration required
                  </p>
                </CardHeader>
              </Card>

              <Card className="gap-4 bg-primary/10 text-center">
                <Heart className="mx-auto size-8 text-primary" />
                <CardHeader>
                  <CardTitle>Peer Support</CardTitle>
                  <p className="text-xs text-primary">
                    Connect with others who understand
                  </p>
                </CardHeader>
              </Card>

              <Card className="gap-4 bg-primary/10 text-center">
                <MessageSquare className="mx-auto size-8 text-primary" />
                <CardHeader>
                  <CardTitle>Safe Space</CardTitle>
                  <p className="text-xs text-primary">Moderated environment</p>
                </CardHeader>
              </Card>
            </div>

            {/* Chat Button */}
            <div className="mt-6 text-center">
              <Button asChild size="lg">
                <Link href="/military-support/chat">
                  <MessageSquare className="mr-2 size-4" />
                  Join Anonymous Chat Rooms
                </Link>
              </Button>
            </div>
          </CardContent>

          <CardFooter>
            <p
              className={`
                mx-auto max-w-prose text-center text-xs text-pretty
                text-muted-foreground
              `}
            >
              By joining, you acknowledge this is peer support, not professional
              counseling. For crisis situations, please use the hotlines above.
            </p>
          </CardFooter>

          {/* NEW: Manual Mood Check-in Button */}
          {hasCheckedMoodToday && (
            <div className="mt-4 border-t border-emerald-200 pt-4 text-center">
              <Button
                onClick={() => setShowMoodModal(true)}
                className={`
                  text-sm text-emerald-600 underline
                  hover:text-emerald-700
                `}
              >
                Update my daily mood check-in
              </Button>
            </div>
          )}
        </Card>
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
