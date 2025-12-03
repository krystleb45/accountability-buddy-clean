import Stripe from "stripe"

import type { User as IUser } from "../../types/mongoose.gen.js"

import { logger } from "../../utils/winston-logger.js"
import { User } from "../models/User.js"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function createStripeCustomer(email: string) {
  const customer = await stripe.customers.create({ email })
  return customer.id
}

function mapLookupKeyToPlan(key: string) {
  const [plan, cycle] = key.split("_")
  return { tier: plan, billingCycle: cycle }
}

export async function handleInvoicePaymentSucceeded(
  invoice: Stripe.Invoice,
): Promise<void> {
  try {
    const customerId = invoice.customer as string
    const user = await User.findOne({ stripeCustomerId: customerId })

    if (!user) {
      logger.warn(`User not found for Stripe customer ${customerId}`)
      return
    }

    // Update user's subscription status to active
    user.subscription_status = "active"

    await user.save()

    logger.info(
      `✅ Payment succeeded for user ${user.email} - subscription activated`,
    )
  } catch (error) {
    logger.error("❌ Error handling payment succeeded:", error)
  }
}

export async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice,
): Promise<void> {
  try {
    const customerId = invoice.customer as string
    const user = await User.findOne({ stripeCustomerId: customerId })

    if (!user) {
      logger.warn(`User not found for Stripe customer ${customerId}`)
      return
    }

    // Set subscription to past_due
    user.subscription_status = "past_due"
    await user.save()

    logger.warn(
      `⚠️ Payment failed for user ${user.email} - subscription past due`,
    )
  } catch (error) {
    logger.error("❌ Error handling payment failed:", error)
  }
}

export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
) {
  try {
    const customerId = subscription.customer as string
    const user = await User.findOne({ stripeCustomerId: customerId })

    if (!user) {
      logger.warn(`User not found for Stripe customer ${customerId}`)
      return
    }

    if (subscription.cancellation_details.reason === "payment_failed") {
      user.subscription_status = "expired"
      logger.warn(
        `⚠️ Subscription canceled due to payment failure for user ${user.email}`,
      )
    } else {
      user.subscription_status = "canceled"
      logger.info(`Subscription canceled for user ${user.email}`)
    }

    user.subscriptionEndDate = undefined
    user.next_billing_date = undefined
    user.stripeSubscriptionId = undefined
    await user.save()
  } catch (error) {
    logger.error("❌ Error handling subscription deleted:", error)
  }
}

export async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
) {
  try {
    const customerId = subscription.customer as string
    const user = await User.findOne({ stripeCustomerId: customerId })

    if (!user) {
      logger.warn(`User not found for Stripe customer ${customerId}`)
      return
    }

    // Get the price ID from the subscription to determine tier
    const subscriptionItem = subscription.items.data[0]
    const price = subscriptionItem.price
    const lookupKey = price.lookup_key

    const { tier, billingCycle } = mapLookupKeyToPlan(lookupKey)

    user.subscriptionTier = tier as IUser["subscriptionTier"]
    user.billing_cycle = billingCycle as IUser["billing_cycle"]

    // Update Stripe subscription ID if it changed
    user.stripeSubscriptionId = subscription.id

    // Update next billing date
    user.subscriptionEndDate = undefined
    user.subscriptionStartDate = new Date(subscription.start_date * 1000)
    user.next_billing_date = new Date(
      subscriptionItem.current_period_end * 1000,
    )

    await user.save()

    logger.info(
      `📝 Updated user ${user.email} to ${tier} plan (${billingCycle})`,
    )
  } catch (error) {
    logger.error("❌ Error handling subscription updated:", error)
  }
}

/**
 * Handle checkout session completion (for new subscriptions)
 */
export async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
) {
  try {
    if (session.mode !== "subscription") {
      return
    }

    const customerId = session.customer.toString()
    const customerEmail = session.customer_email
    const user = await User.findOne({
      $or: [{ stripeCustomerId: customerId }, { email: customerEmail }],
    })

    if (!user) {
      logger.warn(`User not found for Stripe customer ${customerEmail}`)
      return
    }

    // Get subscription details
    const subscriptionId = session.subscription as string
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)

    const subscriptionItem = subscription.items.data[0]
    const price = subscriptionItem.price
    const lookupKey = price.lookup_key

    const { tier, billingCycle } = mapLookupKeyToPlan(lookupKey)

    // Update user with new subscription details
    user.stripeCustomerId = subscription.customer.toString()

    user.subscriptionTier = tier as IUser["subscriptionTier"]
    user.billing_cycle = billingCycle as IUser["billing_cycle"]

    user.stripeSubscriptionId = subscriptionId

    user.subscriptionStartDate = new Date(subscription.start_date * 1000)
    user.next_billing_date = new Date(
      subscriptionItem.current_period_end * 1000,
    )

    await user.save()

    logger.info(
      `🎉 New subscription created for user ${user.email} - ${tier} plan`,
    )
  } catch (error) {
    logger.error("❌ Error handling checkout completed:", error)
  }
}
