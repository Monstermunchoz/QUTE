import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { getSiteUrl, isAllowedPriceId } from "@/lib/stripe/config";
import { getStripe } from "@/lib/stripe/server";
import { estPremium } from "@/lib/subscription";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function randomSuffix() {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  return Array.from(
    { length: 8 },
    () => chars[Math.floor(Math.random() * 26)],
  ).join("");
}

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    priceId?: string;
  } | null;
  const priceId = body?.priceId?.trim() ?? "";

  if (!priceId || !isAllowedPriceId(priceId)) {
    return NextResponse.json({ error: "Tarif invalide" }, { status: 400 });
  }

  const { data: profil } = await supabase
    .from("profiles")
    .select(
      "id, pseudo, stripe_customer_id, essai_utilise, abonnement, abonnement_statut",
    )
    .eq("id", user.id)
    .maybeSingle();

  if (!profil) {
    return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
  }

  if (estPremium(profil) && profil.stripe_customer_id) {
    const portal = await getStripe().billingPortal.sessions.create({
      customer: profil.stripe_customer_id,
      return_url: `${getSiteUrl()}/abonnement`,
      locale: "fr",
    });

    return NextResponse.json({ url: portal.url });
  }

  const admin = createServiceClient();
  let customerId = profil.stripe_customer_id as string | null;

  if (!customerId) {
    const customer = await getStripe().customers.create({
      email: user.email ?? undefined,
      name: (profil.pseudo as string | null) ?? undefined,
      metadata: { user_id: user.id },
    });

    customerId = customer.id;

    const { error } = await admin
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  const trialDays = profil.essai_utilise ? undefined : 7;

  const session = await getStripe().checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      ...(trialDays ? { trial_period_days: trialDays } : {}),
      metadata: { user_id: user.id },
    },
    locale: "fr",
    allow_promotion_codes: true,
    success_url: `${getSiteUrl()}/abonnement?success=1`,
    cancel_url: `${getSiteUrl()}/abonnement?annule=1`,
    metadata: { user_id: user.id },
    integration_identifier: `qute-abo-${randomSuffix()}`,
  });

  if (!session.url) {
    return NextResponse.json(
      { error: "Impossible de créer la session" },
      { status: 500 },
    );
  }

  return NextResponse.json({ url: session.url });
}
