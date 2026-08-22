import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/stripe/config";
import { resolveStripeCustomer } from "@/lib/stripe/customer";
import { getStripe } from "@/lib/stripe/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STRIPE_SUB = "Aucun abonnement actif via Stripe.";

export async function POST() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const { data: profil } = await supabase
    .from("profiles")
    .select("id, pseudo, stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profil) {
    return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
  }

  try {
    const customerId = await resolveStripeCustomer({
      userId: user.id,
      email: user.email,
      name: (profil.pseudo as string | null) ?? undefined,
      existingId: (profil.stripe_customer_id as string | null) ?? null,
      createIfMissing: false,
    });

    if (!customerId) {
      return NextResponse.json(
        { error: NO_STRIPE_SUB, redirect: "/abonnement" },
        { status: 400 },
      );
    }

    const session = await getStripe().billingPortal.sessions.create({
      customer: customerId,
      return_url: `${getSiteUrl()}/abonnement`,
      locale: "fr",
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur Stripe";
    console.error("[stripe/portal]", error);
    return NextResponse.json(
      { error: message, redirect: "/abonnement" },
      { status: 500 },
    );
  }
}
