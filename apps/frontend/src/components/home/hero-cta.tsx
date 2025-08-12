"use client"

import { ArrowDown } from "lucide-react"
import { useSession } from "next-auth/react"
import Link from "next/link"

import { Button } from "../ui/button"

export function HeroCta() {
  const { status } = useSession()

  return status === "authenticated" ? (
    <Button size="lg" asChild variant="outline">
      <Link href="/dashboard">Go to Dashboard</Link>
    </Button>
  ) : (
    <>
      <div
        className={`
          mb-6 flex flex-col gap-4
          sm:flex-row
        `}
      >
        <Button asChild size="lg" className="px-8 py-4">
          <Link href="/register">Get Started</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="px-8 py-4">
          <Link href="/login">Already have an account?</Link>
        </Button>
      </div>
      <div className="mt-4 animate-bounce">
        <ArrowDown />
      </div>
    </>
  )
}
