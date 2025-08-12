"use client"

import { useSession } from "next-auth/react"

import { Pricing } from "../pricing"

export function PricingSection() {
  const { status } = useSession()

  if (status === "authenticated") {
    return null
  }

  return (
    <section className="border-t bg-popover px-4 py-8">
      <div className="mx-auto max-w-screen-xl">
        <Pricing
          ctaAsLink={true}
          title="Choose Your Path to Success"
          subtitle="Whether you're just starting your journey or ready to take it to the next level, we have a plan that fits your goals and budget."
        />
      </div>
    </section>
  )
}
