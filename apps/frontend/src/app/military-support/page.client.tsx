"use client"

import { useMutation, useQuery } from "@tanstack/react-query"
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
import { toast } from "sonner"

import {
  fetchDisclaimer,
  fetchResources,
} from "@/api/military-support/military-support-api"
import * as moodCheckInApi from "@/api/military-support/mood-check-in-api"
import { CommunityMoodWidget } from "@/components/MilitarySupport/community-mood-widget"
import { MoodCheckInDialog } from "@/components/MilitarySupport/mood-check-in-dialog"
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
    phone: { text: "988 (Press 1)", href: "tel:988" },
    text: "Text 838255",
    description:
      "24/7 free, confidential crisis support for veterans and their families",
    urgent: true,
  },
  {
    title: "Military Crisis Line",
    phone: { text: "1-800-273-8255", href: "tel:1-800-273-8255" },
    description: "24/7 support for active duty, National Guard, and Reserve",
    urgent: true,
  },
  {
    title: "National Suicide Prevention Lifeline",
    phone: { text: "988", href: "tel:988" },
    description: "24/7 crisis counseling and suicide prevention",
    urgent: true,
  },
]

export default function MilitarySupportPageClient() {
  const [showAllResources, setShowAllResources] = useState(false)

  const [showMoodModal, setShowMoodModal] = useState(false)
  const [moodSessionId, setMoodSessionId] = useState<string>("")
  const [moodSubmissionTime, setMoodSubmissionTime] = useState(0) // To force widget refresh

  const initializeAnonymousSessionId = async () => {
    let sessionId = localStorage.getItem("ab_military-mood-session")
    if (!sessionId || !sessionId.startsWith("anon_")) {
      sessionId = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
      localStorage.setItem("ab_military-mood-session", sessionId)
    }
    setMoodSessionId(sessionId)
  }

  const { data: hasCheckedMoodToday, isFetched: isMoodStatusFetched } =
    useQuery({
      queryKey: ["military-support", "mood-checkin-status"],
      queryFn: () => moodCheckInApi.hasSubmittedToday(moodSessionId),
      enabled: moodSessionId.length > 0,
    })

  const {
    data: disclaimer,
    isLoading: isLoadingDisclaimer,
    error: errorDisclaimer,
  } = useQuery({
    queryKey: ["military-support", "disclaimer"],
    queryFn: fetchDisclaimer,
  })

  const {
    data: resources,
    isLoading: isLoadingResources,
    error: errorResources,
  } = useQuery({
    queryKey: ["military-support", "resources"],
    queryFn: fetchResources,
  })

  useEffect(() => {
    initializeAnonymousSessionId()
  }, [])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isMoodStatusFetched && !hasCheckedMoodToday) {
      timer = setTimeout(() => {
        setShowMoodModal(true)
      }, 2000)
    }

    return () => clearTimeout(timer)
  }, [isMoodStatusFetched, hasCheckedMoodToday])

  const { mutate: handleMoodSubmit, isPending } = useMutation({
    mutationFn: ({ mood, note }: { mood: number; note?: string }) =>
      moodCheckInApi.submitMoodCheckIn(mood, note, moodSessionId),
    onSuccess: () => {
      toast.success("Mood check-in submitted successfully")
      setShowMoodModal(false)
      // Force refresh the community mood widget by updating its key
      setMoodSubmissionTime(Date.now())
    },
  })

  const loading = isLoadingDisclaimer || isLoadingResources
  const error = errorDisclaimer || errorResources

  useEffect(() => {
    if (error) {
      toast.error(
        "Failed to load military support data. Please try again later.",
      )
    }
  }, [error])

  // Show only first 6 resources initially
  const displayedResources = showAllResources
    ? resources
    : resources?.slice(0, 6)

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
                    <p className="text-xl font-bold">
                      <a
                        href={resource.phone.href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {resource.phone.text}
                      </a>
                    </p>
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
              <strong>Please note:</strong> {disclaimer}
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
            {resources && resources.length === 0 ? (
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
                  {displayedResources?.map((resource) => (
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
                {resources && resources.length > 6 && (
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

          <CardFooter className="block">
            <p
              className={`
                mx-auto max-w-prose text-center text-xs text-pretty
                text-muted-foreground
              `}
            >
              By joining, you acknowledge this is peer support, not professional
              counseling. For crisis situations, please use the hotlines above.
            </p>

            {/* Manual Mood Check-in Button */}
            {isMoodStatusFetched && !hasCheckedMoodToday && (
              <div className="mt-4 border-t pt-4 text-center">
                <Button onClick={() => setShowMoodModal(true)}>
                  Daily Mood Check-In
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>
      </section>

      {/* NEW: Mood Check-In Modal */}
      <MoodCheckInDialog
        isOpen={showMoodModal}
        onOpenChange={(open) => setShowMoodModal(open)}
        onSubmit={(mood, note) => handleMoodSubmit({ mood, note })}
        isSubmitting={isPending}
        sessionId={moodSessionId}
      />
    </div>
  )
}
