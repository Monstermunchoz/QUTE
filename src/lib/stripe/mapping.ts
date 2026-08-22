import type Stripe from "stripe";
import { planFromPriceId, type PaidPlanId } from "@/lib/stripe/config";
import type { AbonnementStatut } from "@/lib/subscription";

export function priceIdFromSubscription(subscription: Stripe.Subscription) {
  const price = subscription.items.data[0]?.price;
  return typeof price === "string" ? price : price?.id ?? null;
}

export function planFromSubscription(subscription: Stripe.Subscription): PaidPlanId | null {
  return planFromPriceId(priceIdFromSubscription(subscription));
}

export function periodEndIso(subscription: Stripe.Subscription) {
  const end =
    subscription.items.data[0]?.current_period_end ?? subscription.trial_end;

  if (!end) {
    return null;
  }

  return new Date(end * 1000).toISOString();
}

export function statutFromSubscription(
  subscription: Stripe.Subscription,
): AbonnementStatut {
  if (
    subscription.cancel_at_period_end &&
    (subscription.status === "active" || subscription.status === "trialing")
  ) {
    return "annule";
  }

  switch (subscription.status) {
    case "trialing":
      return "essai";
    case "active":
      return "actif";
    case "past_due":
    case "unpaid":
      return "impaye";
    case "canceled":
    case "incomplete_expired":
      return "annule";
    default:
      return "inactif";
  }
}

export function subscriptionIdFromInvoice(invoice: Stripe.Invoice) {
  const parent = invoice.parent;

  if (parent?.type === "subscription_details") {
    const subscription = parent.subscription_details?.subscription;
    return typeof subscription === "string" ? subscription : subscription?.id ?? null;
  }

  return null;
}

export function customerId(
  customer: string | { id: string } | null | undefined,
) {
  if (!customer) {
    return null;
  }

  return typeof customer === "string" ? customer : customer.id;
}
