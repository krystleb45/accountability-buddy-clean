"use client"

import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, DoorOpenIcon, Loader2, Shield, Users } from "lucide-react"
import Link from "next/link"

import * as anonymousMilitaryChatApi from "@/api/military-support/anonymous-military-chat-api"

import { LoadingSpinner } from "../loading-spinner"
import { Button } from "../ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card"

export function AnonymousChatSelector() {
  const {
    data: rooms,
    isPending,
    isFetching,
    error,
    refetch: loadRooms,
  } = useQuery({
    queryKey: ["military-support", "rooms"],
    queryFn: anonymousMilitaryChatApi.getAnonymousRooms,
  })

  if (isPending) {
    return (
      <div className="grid place-items-center py-80">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <Button variant="link" size="sm" asChild className="self-start !px-0">
          <Link href="/military-support">
            <ArrowLeft /> Back to Military Support
          </Link>
        </Button>

        <div className="mt-10 text-center">
          <h2 className="mb-4 text-2xl font-semibold">
            Unable to Load Chat Rooms
          </h2>
          <p>
            An error occurred while fetching the chat rooms. Please try again.
          </p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
          <div className="mt-6">
            <Button onClick={() => loadRooms()} disabled={isFetching}>
              {isFetching ? <Loader2 className="animate-spin" /> : null}
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <section className="flex flex-1 flex-col gap-6">
      <Button variant="link" size="sm" asChild className="self-start !px-0">
        <Link href="/military-support">
          <ArrowLeft /> Back to Military Support
        </Link>
      </Button>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Anonymous Military Chat Rooms</h1>
        <p className="text-muted-foreground">
          Connect with fellow service members in a safe, anonymous environment
        </p>
      </div>

      {/* Main Content  */}

      {/* Privacy Notice  */}
      <Card className="border-chart-2 bg-chart-2/10">
        <CardHeader className="self-center">
          <CardTitle className="flex items-center gap-2">
            <Shield className="size-5 text-chart-2" strokeWidth={3} />
            <h3 className="font-semibold">Your Privacy & Safety</h3>
          </CardTitle>
        </CardHeader>
        <CardContent className="self-center">
          <ul className="list-disc space-y-1 pl-6 text-sm">
            <li>Anonymous names assigned automatically</li>
            <li>No registration required</li>
            <li>Messages deleted after 24 hours</li>
            <li>Peer support, not professional counseling</li>
          </ul>
        </CardContent>
      </Card>

      {/* Chat Rooms - HORIZONTAL GRID */}
      <div
        className={`
          grid gap-6
          md:grid-cols-3
        `}
      >
        {rooms.map((room) => (
          <Card key={room.id}>
            {/* Compact Room Content */}
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {/* Icon */}
                <div className="text-3xl">{room.icon}</div>

                {/* Title */}
                <h3 className="text-xl font-bold">{room.name}</h3>
              </CardTitle>
            </CardHeader>

            <CardContent>
              {/* Description - Shorter */}
              <p className="leading-relaxed text-pretty text-muted-foreground">
                {room.description}
              </p>

              {/* Online Count - Compact */}
              <div
                className={`
                  mt-6 flex items-center justify-center text-sm
                  text-muted-foreground
                `}
              >
                <Users className="mr-1 size-4" />
                <span>{room.memberCount} online</span>
              </div>
            </CardContent>

            <CardFooter className="mt-auto">
              <Button asChild className="w-full">
                <Link href={`/military-support/chat/${room.id}`}>
                  Join Chat <DoorOpenIcon />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  )
}
