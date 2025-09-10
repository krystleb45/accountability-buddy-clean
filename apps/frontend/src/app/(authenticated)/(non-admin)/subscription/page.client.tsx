"use client"

import type { BillingCycle, PlanId } from "@ab/shared/pricing"

import { PRICING } from "@ab/shared/pricing"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import {
  ArrowRight,
  Calendar,
  CalendarSync,
  CalendarX2,
  Check,
  CheckLine,
  CircleDollarSign,
  Goal,
  Headset,
  Loader,
  MessageSquareLock,
  MessagesSquare,
  Receipt,
  RefreshCcw,
  X,
  Zap,
} from "lucide-react"
import { motion } from "motion/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import {
  cancelSubscription,
  changeSubscriptionPlan,
  createBillingPortalSession,
} from "@/api/subscription/subscription-api"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Pricing } from "@/components/pricing"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSubscription } from "@/hooks/useSubscription"
import { cn } from "@/lib/utils"

export default function SubscriptionClient() {
  const data = useSubscription()
  const {
    isLoading,

    subscriptionTier,
    subscriptionStatus,
    isSubscriptionActive,
    subscriptionEndDate,
    nextBillingDate,
    billingCycle,

    createCheckoutSession,
    isCreatingCheckoutSession,

    isInTrial,
    daysUntilTrialEnd,
    trialEndDate,

    hasUnlimitedGoals,
    hasDMMessaging,
    hasPrivateRooms,
    hasWeeklyMeetings,
    hasStreakTracker,

    maxGoals,
    currentGoalCount,
  } = data

  const currentPlan = PRICING.find((plan) => plan.id === subscriptionTier)
  const currentPrice = currentPlan?.price[billingCycle]
  const currentTierIndex = PRICING.findIndex((p) => p.id === subscriptionTier)

  const [showRenewalPlans, setShowRenewalPlans] = useState(false)
  const [newPlan, setNewPlan] = useState<PlanId | null>(null)
  const [newBillingCycle, setNewBillingCycle] =
    useState<BillingCycle>(billingCycle)

  const {
    mutate: createBillingPortalSessionFn,
    isPending: isCreatingPortalSession,
  } = useMutation({
    mutationFn: createBillingPortalSession,
    onSuccess: (url) => {
      window.location.href = url
    },
    onError: (error) => {
      toast.error(
        "Failed to create billing portal session. Please try again.",
        {
          description: error.message,
        },
      )
    },
  })

  const queryClient = useQueryClient()
  const router = useRouter()

  const { mutate: cancelSubscriptionFn, isPending: isCancellingSubscription } =
    useMutation({
      mutationFn: cancelSubscription,
      onSuccess: (data) => {
        toast.success("Subscription cancelled successfully", {
          description: data.message,
        })
        queryClient.invalidateQueries({ queryKey: ["me", "limits"] })
        router.refresh()
      },
      onError: (error) => {
        toast.error("Failed to cancel subscription. Please try again.", {
          description: error.message,
        })
      },
    })

  const { mutate: changePlanFn, isPending: isChangingPlan } = useMutation({
    mutationFn: ({
      planId,
      billingCycle,
    }: {
      planId: PlanId
      billingCycle: BillingCycle
    }) => changeSubscriptionPlan(planId, billingCycle),
    onSuccess: () => {
      toast.success("Subscription plan changed successfully")
      queryClient.invalidateQueries({ queryKey: ["me", "limits"] })
      router.refresh()
    },
    onError: (error) => {
      toast.error("Failed to change subscription plan. Please try again.", {
        description: error.message,
      })
    },
  })

  const isUpgrade = (planId: PlanId) => {
    const planIndex = PRICING.findIndex((p) => p.id === planId)
    return planIndex > currentTierIndex
  }

  const isDowngrade = (planId: PlanId) => {
    const planIndex = PRICING.findIndex((p) => p.id === planId)
    return planIndex < currentTierIndex && planIndex >= 0
  }

  const getNewPrice = (planId: PlanId, billingCycle: BillingCycle) => {
    const plan = PRICING.find((p) => p.id === planId)

    return billingCycle === "yearly" ? plan?.price.yearly : plan?.price.monthly
  }

  const getPriceDiff = (planId: PlanId, newBillingCycle: BillingCycle) => {
    const plan = PRICING.find((p) => p.id === planId)
    const yearlyPrice = plan?.price.yearly || 0
    const monthlyPrice = plan?.price.monthly || 0
    const currentYearlyPrice =
      (currentPrice || 0) * (billingCycle === "monthly" ? 12 : 1)
    const currentMonthlyPrice =
      (currentPrice || 0) / (billingCycle === "monthly" ? 1 : 12)

    if (newBillingCycle === "yearly") {
      return yearlyPrice - currentYearlyPrice
    }
    return monthlyPrice - currentMonthlyPrice
  }

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-12 py-12">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex items-center gap-2"
      >
        <Receipt size={36} className="text-primary" />
        <h1 className="text-3xl font-bold">
          {isSubscriptionActive
            ? "Manage Your Subscription"
            : subscriptionStatus === "past_due"
              ? "Your subscription is past due"
              : subscriptionStatus === "expired"
                ? "Your subscription has expired. Choose a new plan below."
                : "Choose Your Plan"}
        </h1>
      </motion.header>

      {/* Trial Banner */}
      {isInTrial && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className={`
            rounded-lg border border-primary bg-primary/10 px-6 py-4 text-center
          `}
        >
          <span className="font-semibold">
            {daysUntilTrialEnd > 0
              ? `${daysUntilTrialEnd} days left in your free trial`
              : "Your free trial is ending soon"}
          </span>
        </motion.div>
      )}

      {/* Canceled Banner */}
      {subscriptionStatus === "canceled" && subscriptionEndDate && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className={`
            rounded-lg border border-destructive bg-destructive/10 px-6 py-4
            text-center
          `}
        >
          <span className="font-semibold">
            Your subscription is canceled and will end on{" "}
            {format(subscriptionEndDate, "PP")}.
          </span>
        </motion.div>
      )}

      <div>
        {isSubscriptionActive ? (
          // Current subscription management
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Current Plan Card */}
            <Card>
              <CardHeader>
                <CardTitle className="mb-4 text-2xl font-bold">
                  Current Plan:{" "}
                  <span className="text-primary capitalize">
                    {subscriptionTier === "free-trial"
                      ? "Free Trial"
                      : subscriptionTier}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent
                className={`
                  grid gap-6
                  md:grid-cols-2
                `}
              >
                <div>
                  <h3 className="mb-3 text-lg font-semibold">Plan Details</h3>
                  <ul
                    className={`
                      space-y-4
                      *:flex *:items-center *:gap-3
                      [&_svg]:shrink-0
                    `}
                  >
                    {isInTrial ? (
                      trialEndDate ? (
                        <li>
                          <Calendar className="text-primary" />{" "}
                          <span>
                            <small
                              className={`
                                block font-medium text-muted-foreground
                                uppercase
                              `}
                            >
                              Trial End Date
                            </small>{" "}
                            <strong>{format(trialEndDate, "PP")}</strong>
                          </span>
                        </li>
                      ) : null
                    ) : (
                      <>
                        <li>
                          <CircleDollarSign className="text-primary" />{" "}
                          <span>
                            <small
                              className={`
                                block font-medium text-muted-foreground
                                uppercase
                              `}
                            >
                              Paying:
                            </small>{" "}
                            <strong>
                              ${currentPrice} /
                              {billingCycle === "monthly" ? "month" : "year"}
                            </strong>
                          </span>
                        </li>
                        <li>
                          <RefreshCcw className="text-primary" />{" "}
                          <span>
                            <small
                              className={`
                                block font-medium text-muted-foreground
                                uppercase
                              `}
                            >
                              Billing Cycle:
                            </small>{" "}
                            <strong>{billingCycle}</strong>
                          </span>
                        </li>
                        {nextBillingDate ? (
                          <li>
                            <CalendarSync className="text-primary" />{" "}
                            <span>
                              <small
                                className={`
                                  block font-medium text-muted-foreground
                                  uppercase
                                `}
                              >
                                Next Billing Date:
                              </small>{" "}
                              <strong>{format(nextBillingDate, "PP")}</strong>
                            </span>
                          </li>
                        ) : null}
                        {subscriptionEndDate ? (
                          <li>
                            <CalendarX2 className="text-destructive" />{" "}
                            <span>
                              <small
                                className={`
                                  block font-medium text-muted-foreground
                                  uppercase
                                `}
                              >
                                Subscription End Date:
                              </small>{" "}
                              <strong>
                                {format(subscriptionEndDate, "PP")}
                              </strong>
                            </span>
                          </li>
                        ) : null}
                        <li>
                          {["active", "trial"].includes(
                            subscriptionStatus ?? "",
                          ) ? (
                            <CheckLine className="text-primary" />
                          ) : (
                            <X className="text-destructive" />
                          )}{" "}
                          <span>
                            <small
                              className={`
                                block font-medium text-muted-foreground
                                uppercase
                              `}
                            >
                              Status:
                            </small>{" "}
                            <strong className="capitalize">
                              {subscriptionStatus}
                            </strong>
                          </span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
                <div>
                  <h3 className="mb-3 text-lg font-semibold">Your Features</h3>
                  <ul
                    className={`
                      space-y-4
                      *:flex *:items-center *:gap-3
                      [&_svg]:shrink-0
                    `}
                  >
                    <li>
                      <Goal className="text-primary" />{" "}
                      <div>
                        <p>
                          {hasUnlimitedGoals
                            ? "Unlimited Goals"
                            : `Up to ${maxGoals} Goals`}{" "}
                          {!hasUnlimitedGoals && (
                            <span className="text-sm text-muted-foreground">
                              ({currentGoalCount}/{maxGoals} used)
                            </span>
                          )}
                        </p>
                      </div>
                    </li>
                    {hasStreakTracker && (
                      <li>
                        <Zap className="text-primary" />{" "}
                        <div>
                          <p>Streak Tracker</p>
                        </div>
                      </li>
                    )}
                    {hasDMMessaging && (
                      <li>
                        <MessagesSquare className="text-primary" />{" "}
                        <div>
                          <p>Direct Messaging</p>
                        </div>
                      </li>
                    )}
                    {hasPrivateRooms && (
                      <li>
                        <MessageSquareLock className="text-primary" />{" "}
                        <div>
                          <p>Private Chatrooms</p>
                        </div>
                      </li>
                    )}
                    {hasWeeklyMeetings && (
                      <li className="flex items-center">
                        <Headset className="text-primary" />{" "}
                        <span>Weekly Accountability Meetings</span>
                      </li>
                    )}
                  </ul>
                </div>
              </CardContent>

              <CardFooter className="flex justify-end gap-4 border-t">
                {subscriptionStatus === "canceled" ? (
                  <Button onClick={() => setShowRenewalPlans(true)}>
                    Renew Subscription
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    onClick={() => cancelSubscriptionFn()}
                    disabled={isCancellingSubscription}
                  >
                    {isCancellingSubscription ? (
                      <Loader className="animate-spin" />
                    ) : null}{" "}
                    Cancel Subscription
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => createBillingPortalSessionFn()}
                  disabled={isCreatingPortalSession}
                >
                  {isCreatingPortalSession ? (
                    <Loader className="animate-spin" />
                  ) : null}{" "}
                  Manage Billing
                </Button>
              </CardFooter>
            </Card>

            {/* Available Plan Changes */}
            {subscriptionStatus !== "canceled" && (
              <div>
                <h2 className="mt-10 mb-6 text-2xl font-bold">
                  Available Plan Changes
                </h2>
                <Tabs
                  value={newBillingCycle}
                  onValueChange={(value) =>
                    setNewBillingCycle(value as BillingCycle)
                  }
                >
                  <TabsList className="mb-4 h-auto min-w-sm gap-2 p-2">
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
                      grid grid-cols-1 gap-6
                      md:grid-cols-2
                      lg:grid-cols-3
                    `}
                  >
                    {PRICING.filter((plan) => plan.id !== "free-trial").map(
                      (plan) => {
                        const isUpgradeOption = isUpgrade(plan.id)
                        const isDowngradeOption = isDowngrade(plan.id)
                        const newPrice = getNewPrice(plan.id, newBillingCycle)
                        const priceDiff = getPriceDiff(plan.id, newBillingCycle)

                        return (
                          <Card
                            key={plan.id}
                            className={cn("h-full", {
                              "border-primary": isUpgradeOption,
                              "border-chart-3": isDowngradeOption,
                            })}
                          >
                            <CardHeader>
                              <CardTitle className="text-xl">
                                {plan.name}
                              </CardTitle>
                              <CardAction>
                                {isUpgradeOption && <Badge>UPGRADE</Badge>}
                                {isDowngradeOption && (
                                  <Badge variant="warning">DOWNGRADE</Badge>
                                )}
                              </CardAction>
                            </CardHeader>
                            <CardContent className="flex flex-1 flex-col">
                              <div className="mb-6 text-center">
                                <span className="text-2xl font-bold">
                                  ${newPrice}
                                </span>{" "}
                                <span className="text-muted-foreground">
                                  /{newBillingCycle === "monthly" ? "mo" : "yr"}
                                </span>
                                {!isInTrial && (
                                  <div className="mt-1 text-sm">
                                    {priceDiff > 0 ? (
                                      <span className="text-primary">
                                        +${priceDiff} per{" "}
                                        {newBillingCycle === "monthly"
                                          ? "month"
                                          : "year"}{" "}
                                        from current plan
                                      </span>
                                    ) : priceDiff < 0 ? (
                                      <span className="text-chart-3">
                                        ${Math.abs(priceDiff)} per{" "}
                                        {newBillingCycle === "monthly"
                                          ? "month"
                                          : "year"}{" "}
                                        savings from current plan
                                      </span>
                                    ) : null}
                                  </div>
                                )}
                              </div>

                              <ul className="mb-6 space-y-2 text-sm">
                                {plan.features.map((feature) => (
                                  <li
                                    key={feature}
                                    className="flex items-center gap-2"
                                  >
                                    <Check className="text-primary" size={20} />
                                    <span>{feature}</span>
                                  </li>
                                ))}
                              </ul>

                              {plan.id === subscriptionTier &&
                              newBillingCycle === billingCycle ? null : (
                                <Button
                                  className="mt-auto"
                                  onClick={() =>
                                    changePlanFn({
                                      planId: plan.id,
                                      billingCycle: newBillingCycle,
                                    })
                                  }
                                  disabled={isChangingPlan}
                                >
                                  {isChangingPlan ? (
                                    <Loader className="animate-spin" />
                                  ) : null}{" "}
                                  {isUpgradeOption
                                    ? "Upgrade"
                                    : isDowngradeOption
                                      ? "Downgrade"
                                      : "Switch"}{" "}
                                  to {plan.name} {newBillingCycle}
                                </Button>
                              )}
                            </CardContent>
                          </Card>
                        )
                      },
                    )}
                  </div>
                </Tabs>
              </div>
            )}
          </motion.div>
        ) : subscriptionStatus === "past_due" ? (
          <Button
            onClick={() =>
              createCheckoutSession({
                planId: subscriptionTier as Exclude<PlanId, "free-trial">,
                billingCycle,
              })
            }
            size="lg"
            className="mx-auto block"
            disabled={isCreatingCheckoutSession}
          >
            {isCreatingCheckoutSession ? (
              <Loader className="animate-spin" />
            ) : null}{" "}
            Pay now to reactivate your subscription
          </Button>
        ) : null}
      </div>

      {(showRenewalPlans ||
        subscriptionStatus === "expired" ||
        (subscriptionStatus === "canceled" && !isSubscriptionActive)) && (
        <div className={cn({ "border-t pt-12": showRenewalPlans })}>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-medium">
            <RefreshCcw className="text-primary" /> Renew Your Subscription
          </h2>
          <Pricing
            onBillingCycleChange={setNewBillingCycle}
            selectedPlan={newPlan}
            onCtaClick={(id) => setNewPlan(id)}
            showFreeTrial={false}
          />
          <Button
            size="lg"
            className="mx-auto mt-8 flex"
            disabled={!newPlan || isChangingPlan || isCreatingCheckoutSession}
            onClick={() =>
              showRenewalPlans
                ? changePlanFn({
                    planId: newPlan as Exclude<PlanId, "free-trial">,
                    billingCycle: newBillingCycle,
                  })
                : createCheckoutSession({
                    planId: newPlan as Exclude<PlanId, "free-trial">,
                    billingCycle: newBillingCycle,
                  })
            }
          >
            {isChangingPlan || isCreatingCheckoutSession ? (
              <Loader className="animate-spin" />
            ) : null}{" "}
            Renew <ArrowRight className="size-6" />
          </Button>
        </div>
      )}
    </div>
  )
}
