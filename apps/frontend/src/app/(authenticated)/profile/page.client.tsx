"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"

import { Profile } from "@/components/profile/profile"
import { Button } from "@/components/ui/button"

export default function ProfileClient() {
  return (
    <main className="flex flex-col items-start gap-6">
      <Button variant="link" size="sm" asChild className="!px-0">
        <Link href="/dashboard">
          <ArrowLeft /> Back to Dashboard
        </Link>
      </Button>

      {/* Your Profile card */}
      <Profile />
    </main>
  )
}
