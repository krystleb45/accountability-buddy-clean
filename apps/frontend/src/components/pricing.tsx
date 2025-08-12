import { PRICING } from "@ab/shared/pricing"
import { Check, SquareCheckBig } from "lucide-react"
import { motion } from "motion/react"
import Link from "next/link"

import { cn } from "@/lib/utils"

import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"

const MotionCard = motion.create(Card)

type PricingProps = {
  title: string
  subtitle: string
  onBillingCycleChange?: (cycle: "monthly" | "yearly") => void
} & (
  | {
      ctaAsLink: true
      onCtaClick?: never
      selectedPlan?: never
    }
  | {
      ctaAsLink?: false
      onCtaClick: (id: (typeof PRICING)[number]["id"]) => void
      selectedPlan: (typeof PRICING)[number]["id"] | null
    }
)

export function Pricing({
  title,
  subtitle,
  ctaAsLink,
  onCtaClick,
  selectedPlan,
  onBillingCycleChange,
}: PricingProps) {
  return (
    <>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-8 text-center"
      >
        <h2
          className={`
            mb-6 text-4xl font-bold text-primary
            md:text-5xl
          `}
        >
          {title}
        </h2>
        <p
          className={`
            mx-auto mb-10 max-w-prose text-lg text-pretty
            md:text-xl
          `}
        >
          {subtitle}
        </p>
      </motion.div>
      {/* Billing Toggle */}
      <Tabs
        defaultValue="yearly"
        onValueChange={(value) =>
          onBillingCycleChange?.(value as "monthly" | "yearly")
        }
      >
        <TabsList className="mx-auto h-auto min-w-sm gap-2 p-2">
          <TabsTrigger
            className="flex h-auto px-4 py-2 text-base"
            value="monthly"
          >
            Monthly
          </TabsTrigger>
          <TabsTrigger
            className="flex h-auto px-4 py-2 text-base"
            value="yearly"
          >
            Yearly
            <Badge className="font-semibold tracking-wider uppercase">
              17% off
            </Badge>
          </TabsTrigger>
        </TabsList>

        <div
          className={`
            mt-12 grid grid-cols-1 gap-6
            md:grid-cols-2
            lg:grid-cols-4
          `}
        >
          {PRICING.map((plan, index) => (
            <MotionCard
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * index, duration: 0.6 }}
              className={cn("relative bg-secondary", {
                "border-2 !border-primary": plan.id === selectedPlan,
              })}
              aria-selected={plan.id === selectedPlan}
            >
              {plan.isPopular && (
                <Badge
                  className={`
                    absolute top-0 left-1/2 z-10 -translate-x-1/2
                    -translate-y-1/2 font-semibold tracking-wider uppercase
                  `}
                >
                  Most popular
                </Badge>
              )}

              <CardHeader>
                <CardTitle className="text-center">{plan.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  {plan.id === "free-trial" ? (
                    <div>
                      <span className="text-3xl font-bold text-primary">
                        Free
                      </span>
                      <p className="text-sm text-muted-foreground">
                        {plan.trialDays} days
                      </p>
                    </div>
                  ) : (
                    <div>
                      <span className="text-3xl font-bold">
                        $
                        <TabsContent value="monthly" className="inline">
                          {plan.price.monthly}
                        </TabsContent>
                        <TabsContent value="yearly" className="inline">
                          {plan.price.yearly}
                        </TabsContent>
                      </span>
                      <span className="text-muted-foreground">
                        {" "}
                        /
                        <TabsContent value="monthly" className="inline">
                          mo
                        </TabsContent>
                        <TabsContent value="yearly" className="inline">
                          yr
                        </TabsContent>
                      </span>
                      <TabsContent value="yearly">
                        <p className="mt-1 text-sm text-primary">
                          Save ${plan.price.monthly * 12 - plan.price.yearly}
                        </p>
                      </TabsContent>
                    </div>
                  )}
                  <p className="mt-4 text-sm">{plan.description}</p>
                </div>

                <ul className="my-8 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check size={20} className="text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="mt-auto block">
                <Button
                  asChild={!!ctaAsLink}
                  size="lg"
                  className="w-full"
                  variant={
                    plan.id === "free-trial" || plan.isPopular
                      ? "default"
                      : "outline"
                  }
                  onClick={() => onCtaClick?.(plan.id)}
                >
                  {ctaAsLink ? (
                    <Link href="/register">{plan.buttonText}</Link>
                  ) : (
                    plan.buttonText
                  )}
                </Button>
              </CardFooter>
            </MotionCard>
          ))}
        </div>
      </Tabs>
      {/* Trust Signals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="mt-12 space-y-4 text-center"
      >
        <p
          className={`
            flex items-center gap-2 justify-self-center text-muted-foreground
          `}
        >
          <SquareCheckBig className="inline-flex text-primary" size={20} />{" "}
          7-day money-back guarantee •{" "}
          <SquareCheckBig className="inline-flex text-primary" size={20} />{" "}
          Cancel anytime •{" "}
          <SquareCheckBig className="inline-flex text-primary" size={20} />{" "}
          Secure payment
        </p>
        <p className="text-sm text-muted-foreground">
          Join thousands of users achieving their goals with accountability
          partners
        </p>
      </motion.div>
    </>
  )
}
