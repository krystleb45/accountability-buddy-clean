"use client"

import { PRICING } from "@ab/shared/pricing"
import { Check, SquareCheckBig } from "lucide-react"
import { motion } from "motion/react"
import { useSession } from "next-auth/react"
import Link from "next/link"

import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"

const MotionCard = motion.create(Card)

export function PricingSection() {
  const { status } = useSession()

  if (status === "authenticated") {
    return null
  }

  return (
    <section className="border-t bg-popover px-4 py-8">
      <div className="mx-auto max-w-screen-xl">
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
            Choose Your Path to Success
          </h2>
          <p
            className={`
              mx-auto mb-10 max-w-prose text-lg text-pretty
              md:text-xl
            `}
          >
            Whether you're just starting your journey or ready to take it to the
            next level, we have a plan that fits your goals and budget.
          </p>
        </motion.div>

        {/* Billing Toggle */}
        <Tabs defaultValue="monthly">
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
                className="relative bg-secondary"
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
                    {plan.trialDays && plan.price === 0 ? (
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
                            {plan.price}
                          </TabsContent>
                          <TabsContent value="yearly" className="inline">
                            {plan.yearlyPrice}
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
                            Save ${plan.price * 12 - plan.yearlyPrice}
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
                    asChild
                    size="lg"
                    className="w-full"
                    variant={
                      plan.trialDays || plan.isPopular ? "default" : "outline"
                    }
                  >
                    <Link href="/register">
                      {plan.trialDays && plan.price === 0
                        ? "Start Free Trial"
                        : `Choose ${plan.name}`}
                    </Link>
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
      </div>
    </section>
  )
}
