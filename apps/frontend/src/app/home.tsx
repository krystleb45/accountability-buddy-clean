import * as motion from "motion/react-client"
import Link from "next/link"

import { HeroCta } from "@/components/home/hero-cta"
import { PricingSection } from "@/components/home/pricing-section"
import { Quotes } from "@/components/quotes"
import { Button } from "@/components/ui/button"

export function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className={`
          relative flex flex-col items-center justify-center px-4 py-20
          text-center
        `}
      >
        <h1
          className={`
            mb-6 text-5xl font-bold text-balance text-primary
            md:text-6xl
            lg:text-7xl
          `}
        >
          Welcome to Accountability Buddy
          <motion.span
            animate={{ rotate: [3, -3] }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              repeatType: "mirror", // Bounces back and forth
            }}
            className="ml-2 inline-block"
          >
            👋
          </motion.span>
        </h1>

        <p
          className={`
            mx-auto mb-8 max-w-2xl text-lg text-balance
            md:text-xl
            lg:text-2xl
          `}
        >
          Join a community of doers and achievers. Track your goals, connect
          with others, and stay motivated.
        </p>

        <HeroCta />
      </section>

      {/* Pricing Section - Only show for non-logged-in users */}
      <PricingSection />

      {/* Military Support Section */}
      <section className="w-full border-t px-8 py-16 text-center">
        <h2
          className={`
            text-4xl font-bold text-primary
            md:text-5xl
          `}
        >
          Military Support
        </h2>
        <p
          className={`
            mx-auto mt-4 max-w-3xl text-lg text-balance
            md:text-xl
          `}
        >
          We offer a dedicated space for active military and veterans to find
          resources, connect, and get support.
        </p>
        <Button asChild className="mt-6" size="lg">
          <Link href="/military-support">Access Military Support</Link>
        </Button>
        <div className="mt-8">
          <Quotes />
        </div>
      </section>
    </div>
  )
}
