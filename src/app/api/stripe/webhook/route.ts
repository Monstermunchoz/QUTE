import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/admin";
import { planFromPriceId, planLabel } from "@/lib/stripe/config";
import {
  customerId,
  periodEndIso,
  planFromSubscription,
  statutFromSubscription,
  subscriptionIdFromInvoice,
} from "@/lib/stripe/mapping";
import { getStripe } from "@/lib/stripe/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AdminClient = ReturnType<typeof createServiceClient>;

async function findUserId(
  admin: AdminClient,
  options: { userId?: string | null; customer?: string | null },
) {
  if (options.userId) {
    return options.userId;
  }

  if (!options.customer) {
    return null;
  }

  const { data } = await admin
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", options.customer)
    .maybeSingle();

  return (data?.id as string | undefined) ?? null;
}

async function applySubscription(
  admin: AdminClient,
  userId: string,
  subscription: Stripe.Subscription,
) {
  const plan = planFromSubscription(subscription);
  const patch: Record<string, unknown> = {
    abonnement: plan ?? "gratuit",
    abonnement_statut: statutFromSubscription(subscription),
    stripe_subscription_id: subscription.id,
    abonnement_fin: periodEndIso(subscription),
  };

  if (subscription.status === "trialing" || Boolean(subscription.trial_end)) {
    patch.essai_utilise = true;
  }

  await admin.from("profiles").update(patch).eq("id", userId);
}

async function handleCheckoutCompleted(
  admin: AdminClient,
  session: Stripe.Checkout.Session,
) {
  const subId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  if (!subId) {
    return;
  }

  const subscription = await getStripe().subscriptions.retrieve(subId);
  const userId = await findUserId(admin, {
    userId: session.metadata?.user_id ?? subscription.metadata?.user_id,
    customer: customerId(session.customer),
  });

  if (!userId) {
    return;
  }

  const plan = planFromSubscription(subscription);

  await admin
    .from("profiles")
    .update({
      abonnement: plan ?? "gratuit",
      abonnement_statut: statutFromSubscription(subscription),
      stripe_customer_id: customerId(session.customer),
      stripe_subscription_id: subscription.id,
      abonnement_fin: periodEndIso(subscription),
      essai_utilise: true,
    })
    .eq("id", userId);
}

async function handleSubscriptionUpdated(
  admin: AdminClient,
  subscription: Stripe.Subscription,
) {
  const userId = await findUserId(admin, {
    userId: subscription.metadata?.user_id,
    customer: customerId(subscription.customer),
  });

  if (!userId) {
    return;
  }

  await applySubscription(admin, userId, subscription);
}

async function handleSubscriptionDeleted(
  admin: AdminClient,
  subscription: Stripe.Subscription,
) {
  const userId = await findUserId(admin, {
    userId: subscription.metadata?.user_id,
    customer: customerId(subscription.customer),
  });

  if (!userId) {
    return;
  }

  await admin
    .from("profiles")
    .update({
      abonnement: "gratuit",
      abonnement_statut: "annule",
      stripe_subscription_id: null,
      abonnement_fin: periodEndIso(subscription),
    })
    .eq("id", userId);
}

async function handleInvoicePaid(admin: AdminClient, invoice: Stripe.Invoice) {
  const customer = customerId(invoice.customer);
  const subscriptionId = subscriptionIdFromInvoice(invoice);
  const userId = await findUserId(admin, {
    userId: invoice.metadata?.user_id ?? null,
    customer,
  });

  if (!userId) {
    return;
  }

  const rawPrice = invoice.lines?.data[0]?.pricing?.price_details?.price;
  let plan = planFromPriceId(
    typeof rawPrice === "string" ? rawPrice : rawPrice?.id,
  );

  let fin: string | null = null;
  let subscriptionStatus: string | null = null;

  if (subscriptionId) {
    const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
    plan = planFromSubscription(subscription) ?? plan;
    fin = periodEndIso(subscription);
    subscriptionStatus = subscription.status;
  }

  if (invoice.amount_paid > 0) {
    await admin.from("paiements").upsert(
      {
        user_id: userId,
        stripe_invoice_id: invoice.id,
        montant: invoice.amount_paid,
        devise: invoice.currency ?? "eur",
        statut: invoice.status ?? "paid",
        plan: plan ? planLabel(plan) : null,
        facture_url: invoice.hosted_invoice_url ?? null,
      },
      { onConflict: "stripe_invoice_id" },
    );
  }

  if (fin && subscriptionStatus && subscriptionStatus !== "trialing") {
    await admin
      .from("profiles")
      .update({ abonnement_fin: fin, abonnement_statut: "actif" })
      .eq("id", userId);
  } else if (fin) {
    await admin.from("profiles").update({ abonnement_fin: fin }).eq("id", userId);
  }
}

async function handleInvoiceFailed(admin: AdminClient, invoice: Stripe.Invoice) {
  const userId = await findUserId(admin, {
    userId: invoice.metadata?.user_id ?? null,
    customer: customerId(invoice.customer),
  });

  if (!userId) {
    return;
  }

  await admin
    .from("profiles")
    .update({ abonnement_statut: "impaye" })
    .eq("id", userId);

  await admin.from("notifications").insert({
    user_id: userId,
    type: "systeme",
    titre: "Paiement en échec",
    contenu:
      "Le paiement de ton abonnement a échoué. Mets à jour ton moyen de paiement pour conserver QUTE+.",
    lien: "/abonnement",
  });
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !secret) {
    return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
  }

  const body = await request.text();
  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(body, signature, secret);
  } catch {
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  const admin = createServiceClient();

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(
          admin,
          event.data.object as Stripe.Checkout.Session,
        );
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(
          admin,
          event.data.object as Stripe.Subscription,
        );
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(
          admin,
          event.data.object as Stripe.Subscription,
        );
        break;
      case "invoice.payment_succeeded":
        await handleInvoicePaid(admin, event.data.object as Stripe.Invoice);
        break;
      case "invoice.payment_failed":
        await handleInvoiceFailed(admin, event.data.object as Stripe.Invoice);
        break;
      default:
        break;
    }
  } catch (error) {
    console.error("stripe webhook", event.type, error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
